// @ts-check
// import express from "express";
// import axios from "axios";
// import encodeUrl from "encodeurl";
// import dotenv from "dotenv";
// import querystring from "querystring";
var axios = require("axios");
var dotenv = require("dotenv");
var querystring = require("querystring");

dotenv.config();

const getAllDurationsInTrafficFromOrigin = async (
    addresses,
    origin
) => {
    let url = "https://maps.googleapis.com/maps/api/distancematrix/json?";
    let destinationsString = addresses
    if(Array.isArray(addresses))
    {
        destinationsString = addresses.join("|place_id:");
    }
    if(!process.env.googleAPIKey)
    {
        throw Error("googleAPIKey has not been set!")
    }
    const params = {
        origins: "place_id:" + origin,
        destinations: "place_id:" + destinationsString,
        key: process.env.googleAPIKey,
        traffic_model: "best_guess",
        departure_time: Date.now(),
    };
    const query = querystring.stringify(params);
    url = url.concat(query);
    try {
        const response = await axios.get(url);
        const responseData = response.data;
        const data = {
            [responseData.origin_addresses]: [],
        };
        var arrayLength = responseData.destination_addresses.length;
        for (var i = 0; i < arrayLength; i++) {
            data[responseData.origin_addresses].push({
                destination_address: responseData.destination_addresses[i],
                duration_in_traffic:
                    responseData.rows[0].elements[i].duration_in_traffic.value,
                distance: responseData.rows[0].elements[i].distance.value,
            });
        }
        return {
            durationsInTrafficFromOrigin: data,
            origin_address: responseData.origin_addresses[0],
        };
    } catch (error) {
        console.error(error);
        return;
    }
};

const getAllDurationsInTrafficFromAddressToAddressPromises = async (
    addresses
) => {
    console.log("LOOK HERE", addresses)
    const data = {};
    let destination_address;
    for (let address of addresses) {
        let url = "https://maps.googleapis.com/maps/api/distancematrix/json?";
        let destinationsString = addresses
        if(Array.isArray(addresses))
        {
            destinationsString = addresses.join("|place_id:");
        }
        const params = {
            origins: "place_id:" + address,
            destinations: "place_id:" + destinationsString,
            key: process.env.googleAPIKey,
            traffic_model: "best_guess",
            departure_time: Date.now(),
        };
        const query = querystring.stringify(params);
        url = url.concat(query);
        console.error(url)
        try {
            const response = await axios.get(url);
            const responseData = response.data;
            data[responseData.origin_addresses] = [];
            const indexOfOriginAddress = responseData.destination_addresses.indexOf(
                responseData.origin_addresses[0]
            );
            if (indexOfOriginAddress > -1) {
                responseData.destination_addresses.splice(indexOfOriginAddress, 1);
                responseData.rows[0].elements.splice(indexOfOriginAddress, 1);
            }
            const arrayLength = responseData.destination_addresses.length;
            for (var i = 0; i < arrayLength; i++) {
                if (address == addresses[addresses.length - 1]) {
                    delete data[responseData.origin_addresses];
                    destination_address = responseData.origin_addresses[0];
                    break;
                }
                data[responseData.origin_addresses].push({
                    destination_address: responseData.destination_addresses[i],
                    duration_in_traffic:
                        responseData.rows[0].elements[i].duration_in_traffic.value,
                    distance: responseData.rows[0].elements[i].distance.value,
                });
            }
        } catch (error) {
            console.error(error);
            return;
        }
    }
    return {
        durationToOtherAddresses: data,
        destination_address: destination_address,
    };
};

const getAllIntermediateAddresses = (addresses) => {
    const intermediateAddresses = Object.keys(addresses);
    return intermediateAddresses;
};

const perm = (xs) => {
    let ret = [];

    for (let i = 0; i < xs.length; i = i + 1) {
        let rest = perm(xs.slice(0, i).concat(xs.slice(i + 1)));

        if (!rest.length) {
            ret.push([xs[i]]);
        } else {
            for (let j = 0; j < rest.length; j = j + 1) {
                ret.push([xs[i]].concat(rest[j]));
            }
        }
    }
    return ret;
};

const finalisePermutations = (
    origin_address,
    intermediatePermutations,
    destination_address
) => {
    intermediatePermutations.forEach((permutation) => {
        permutation.unshift(origin_address);
        permutation.push(destination_address);
    });
    return intermediatePermutations;
};

const calculateDurations = (
    finalisePermutation,
    durationsInTrafficFromOrigin,
    durationToOtherAddresses
) => {
    const pathDurationDistanceArray = [];
    finalisePermutation.forEach((path) => {
        let totalDistanceCost = 0;
        let totalDurationCost = 0;
        // console.log(path)
        let stringThing = "";
        for (let i = 0; i < path.length - 1; i++) {
            let costTo;
            let distanceCostTo;
            let durationCostTo;
            if (i == 0) {
                // @ts-ignore
                costTo = durationsInTrafficFromOrigin[path[i]].filter((obj) => {
                    return obj.destination_address == path[i + 1];
                });
                // console.log(costTo)
                distanceCostTo = costTo[0].distance;
                durationCostTo = costTo[0].duration_in_traffic;
                //466
                stringThing = stringThing + "+" + durationCostTo.toString();
                // console.log("starting from origin",durationCostTo)
                totalDistanceCost += distanceCostTo;
                totalDurationCost += durationCostTo;
            } else {
                // @ts-ignore
                costTo = durationToOtherAddresses[path[i]].filter((obj) => {
                    return obj.destination_address == path[i + 1];
                });
                distanceCostTo = costTo[0].distance;
                durationCostTo = costTo[0].duration_in_traffic;
                stringThing = stringThing + "+" + durationCostTo.toString();
                // console.log("address to address", durationCostTo)
                totalDistanceCost += distanceCostTo;
                totalDurationCost += durationCostTo;
            }
            // console.log(distanceCostTo)
        }
        // console.log(stringThing)
        pathDurationDistanceArray.push({
            path: path,
            distanceCost: totalDistanceCost,
            durationCost: totalDurationCost,
        });
    });
    return pathDurationDistanceArray;
};

const getLowestDuration = (
    durationMatrix
) => {
    return durationMatrix.reduce((prev, current) =>
        prev.durationCost < current.durationCost ? prev : current
    );
};

const getLowestDurationPath = async (origin, intermediateAddresses, finalDestination) => {
    const { durationsInTrafficFromOrigin, origin_address } =
        await getAllDurationsInTrafficFromOrigin(intermediateAddresses, origin);

    const { durationToOtherAddresses, destination_address } =
        await getAllDurationsInTrafficFromAddressToAddressPromises(
            intermediateAddresses.concat(finalDestination)
        );
    const allIntermediateAddresses = getAllIntermediateAddresses(
        durationToOtherAddresses
    );
    const allIntermediateAddressPermutations = perm(allIntermediateAddresses);
    const finalPermutations = finalisePermutations(
        origin_address,
        allIntermediateAddressPermutations,
        destination_address
    );

    const durationMatrix = calculateDurations(finalPermutations, durationsInTrafficFromOrigin, durationToOtherAddresses)
    const lowestDuration = getLowestDuration(durationMatrix)
    return lowestDuration
};

module.exports = getLowestDurationPath
