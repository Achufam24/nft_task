const crypto = require('crypto');
const fs = require('fs');

const generateHash = (filePath) => {
	// get file buffer
	const fileBuffer = fs.readFileSync(filePath);
	// create sha256 hashsum
	const hashSum = crypto.createHash('sha256');
	// update hashsum with file buffer
	hashSum.update(fileBuffer);

	// encode all data to hex format
	const hex = hashSum.digest('hex');

	// return hash
	return hex;
};

module.exports = generateHash;