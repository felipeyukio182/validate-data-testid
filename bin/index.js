const fs = require("fs");
const glob = require("glob");
const cheerio = require("cheerio");
const nodeEmoji = require("node-emoji");
const c = require("chalk");
const chalk = new c.Chalk();

const filesNames = glob.sync("**/*.html", { nodir: true, ignore: ["node_modules/**", "coverage/**"] });

let isMissingDataTestid = false;

console.log(chalk.bold.blue("Validating HTML files without data-testid attribute...\n"));

filesNames.forEach(fileName => {
    const fileContent = fs.readFileSync(fileName, "utf-8");
    const $ = cheerio.load(fileContent);
    const elementsWithoutDataTestid = $('div:not([data-testid]), div[data-testid=""]')?.filter(
        (_, el) => !el.attribs?.['attr.data-testid'] && !el.attribs?.['attr.data-testId']
    );

    if (elementsWithoutDataTestid?.length) {
        isMissingDataTestid = true;

        console.log(chalk.yellow(nodeEmoji.emojify(`:warning:  File: ${fileName} - Elements without data-testid: ${elementsWithoutDataTestid?.length}`)));

        elementsWithoutDataTestid.each((index, element) => {
            console.log(chalk.red(nodeEmoji.emojify(`:exclamation: Element ${index + 1} ${element.name} without data-testid`)));
        });

        console.log('');
    }
});

if (isMissingDataTestid) {
    console.log(chalk.red.bold(nodeEmoji.emojify(":x: data-testid validation ended with errors!")));
    process.exit(1);
} else {
    console.log(chalk.green.bold(nodeEmoji.emojify(":white_check_mark: data-testid validation completed successfully!")));
    process.exit(0);
}

