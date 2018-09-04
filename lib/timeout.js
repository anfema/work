const timeout = async ms => new Promise(res => setTimeout(res, ms));

module.exports = timeout;
