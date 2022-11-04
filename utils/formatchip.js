const formatChip007Keys = (obj) => {
	const formattedObj = {};

	for (let [key, value] of Object.entries(obj)) {
		formattedObj[key.split(' ').join('_').toLowerCase()] = value;
	}
	return formattedObj;
};

module.exports = formatChip007Keys;