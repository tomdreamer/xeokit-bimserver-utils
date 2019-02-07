import express from 'express'

const app = express();
const fs = require('fs');

//

import BimServerClient from "./lib/bimserver/BIMServerClient/bimserverclient.js";
import loadBIMServerMetaModelJSON from "./lib/bimserver/loadBIMServerMetaModelJSON.js";

//

const bimServerAddress = "https://xeokit.cleverapps.io/";
const username = "kevin.flynn@en.com";
const password = "secretPassword";
const poid = 196609;

const modelId = "myModel";
const outputFilePath = "./output/myMetaModel.json";

app.listen(3000, () => console.log('Example app listening on port 3000!'));

const bimServerClient = new BimServerClient(bimServerAddress);

bimServerClient.init(() => {

    console.log("BIMServerClient: Initialized");

    bimServerClient.login(username, password, () => {

        console.log("BIMServerClient: Logged in");

        // Query a project by ID

        bimServerClient.call("ServiceInterface", "getProjectByPoid", {
            poid: poid
        }, (project) => {

            // Load the latest revision of the project

            const roid = project.lastRevisionId;
            const schema = project.schema;

            bimServerClient.getModel(poid, roid, schema, false, bimServerClientModel => {

                loadBIMServerMetaModelJSON(modelId, poid, roid, bimServerClientModel).then(function (modelMetaData) {

                    fs.writeFile(outputFilePath, JSON.stringify(modelMetaData, null, "\t"), function (err) {
                        if (err) {
                            return console.log("Error writing to " + outputFilePath + " : " + err);
                        } else {
                            console.log("Metadata saved in: " + outputFilePath);
                        }
                    });
                });
            });
        }, (error) => {
            console.log("getProjectByPoid failed: " + error);
        });

    }, (error) => {
        console.log("Login failed: " + error);
    });
});