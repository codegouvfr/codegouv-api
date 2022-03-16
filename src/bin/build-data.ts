import { buildCatalog, removeReferent } from "../model/buildCatalog";
import { join as pathJoin } from "path";
import type { CompiledData } from "../model/types";
import * as fs from "fs";

export const softwareJsonRelativeFilePath = "software.json";
export const referentJsonRelativeFilePath = "referent.json";
export const softwareReferentJsonRelativeFilePath = "softwareReferent.json";
export const serviceJsonRelativeFilePath = "service.json";

export const compiledDataJsonRelativeFilePath = "compiledData.json";

(async () => {
    const projectDirPath = pathJoin(__dirname, "..", "..");
    const dataDirPath = pathJoin(projectDirPath, "data");
    const buildDirPath = pathJoin(dataDirPath, "build");
    const compiledDataWithoutReferentJsonRelativeFilePath =
        "compiledData_withoutReferents.json";

    const { compiledData } = await (async () => {
        const read = (relativeFilePath: string) =>
            JSON.parse(
                fs
                    .readFileSync(pathJoin(dataDirPath, relativeFilePath))
                    .toString("utf8"),
            );

        const { catalog } = await buildCatalog({
            "softwareRows": read(softwareJsonRelativeFilePath),
            "referentRows": read(referentJsonRelativeFilePath),
            "softwareReferentRows": read(softwareReferentJsonRelativeFilePath),
            "log": console.log,
        });

        const compiledData: CompiledData<"with referents"> = {
            catalog,
            "services": read(serviceJsonRelativeFilePath),
        };

        return { compiledData };
    })();

    const compiledData_withoutReferents: CompiledData<"without referents"> = {
        ...compiledData,
        "catalog": compiledData.catalog.map(removeReferent),
    };

    if (!fs.existsSync(buildDirPath)) {
        fs.mkdirSync(buildDirPath);
    }

    for (const [relativeJsonFilePath, data] of [
        [compiledDataJsonRelativeFilePath, compiledData],
        [
            compiledDataWithoutReferentJsonRelativeFilePath,
            compiledData_withoutReferents,
        ],
    ] as const) {
        fs.writeFileSync(
            pathJoin(buildDirPath, relativeJsonFilePath),
            Buffer.from(JSON.stringify(data, null, 2), "utf8"),
        );
    }
})();
