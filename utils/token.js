const { sign } = require("jsonwebtoken");

const createTokenClient = (user) => {
	const accessToken = sign(
		{ id: user },
		process.env.JWT_SECRET_KEY,
		{ expiresIn: process.env.JWT_EXPIRE }
	);
	return accessToken;
};

const createTokenTrainer = (user) => {
	const accessToken = sign(
		{ id: user },
		process.env.JWT_SECRET_KEY,
		{ expiresIn: process.env.JWT_EXPIRE }
	);
	return accessToken;
};

// const createTokenAdmin = (user) => {
// 	const accessToken = sign({ username: user }, process.env.JWT_SECRET_KEY, {
// 		expiresIn: process.env.JWT_EXPIRE,
// 	});
// 	return accessToken;
// };
module.exports = { createTokenClient,createTokenTrainer};
