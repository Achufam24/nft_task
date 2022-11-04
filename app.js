const csv = require('csvtojson');
const fs = require('fs');
const { parseAsync } = require('json2csv');
const formatChip007Keys = require('./utils/formatchip');
const generateHash = require('./utils/getHash');
const filePath = 'file/HNG .csv';

// get output file from console input
// const filePath = fs.readFile('HNGi9 CSV FILE - Sheet1.csv', 'utf-8', function (err,data) {
//     console.log(data);
// })

// const filePath = 'HNGi9 CVS FILE - Sheet1.csv';
// const filePath = fs.readFile(file, 'utf-8', function (err,data) {
//     console.log(data);
// })

if (!filePath) {
	console.error('input correct file path');
	return;
}

const JSON_OUTPUT = 'CHIP-0007-output.json';
const CSV_OUTPUT = `${filePath.split('.')[0]}.output.csv`;

(async function () {
	// convert csv to json array
	let jsonArray;

	try {
		jsonArray = await csv().fromFile(filePath);
	} catch (error) {
		console.log('Error: ', error.message);
		return;
	}
	const newArr = [];

	// add format key to json
	for (let obj of jsonArray) {
		// check required fields from Chia CHIP-0007 Docs

		obj = {
			format: 'CHIP-0007',
			...obj,
		};
		const formattedObj = formatChip007Keys(obj);

		// convert attributes to array
		if (formattedObj.attributes) {
			const attributesArr = formattedObj.attributes.split(',');
			const attrFormattedArr = [];

			for (let attr of attributesArr) {
				const attrSplit = attr.split(':');
				console.log('attr split: ', attrSplit);
				if (attrSplit[0] && attrSplit[1]) {
					attrFormattedArr.push(
						formatChip007Keys({
							[`${attrSplit[0].trim()}`]: attrSplit[1].trim(),
						})
					);
				}
			}

			formattedObj.attributes = attrFormattedArr;
		} else {
			formattedObj.attributes = [];
		}
		newArr.push(formattedObj);
	}

	// create json file
	fs.writeFile(
		JSON_OUTPUT,
		JSON.stringify(newArr),
		{ encoding: 'utf8' },
		async (err) => {
			if (err) {
				console.error('Error has occured: ', err);
				return;
			}
			console.log('file written successfully');

			// calculate sha256 hash of json file
			const hash = generateHash(JSON_OUTPUT);
			console.log('Generated hash: ', hash);

			// append hash to each json object and create column in csv
			for (let obj of jsonArray) {
				// obj['UUID'] ? (obj['Hash'] = hash) : 'sfcdsdfsd';
				obj['Hash'] = hash;
			}

			// create csv string
			const csvOutput = await parseAsync(jsonArray);

			// write csv string to file
			fs.writeFile(CSV_OUTPUT, csvOutput, { encoding: 'utf8' }, (err2) => {
				if (err2) {
					console.error('Error occured: ', err2);
					return;
				}

				console.log(
					`Output CSV generated at ${__dirname}\\${CSV_OUTPUT}`
				);
			});
		}
	);
})();