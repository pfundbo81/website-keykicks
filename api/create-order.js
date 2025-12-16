module.exports = (req, res) => {
    // Vercel Serverless Function ist aktiv
    res.status(200).send({ message: 'API is working! Ready to receive orders.' });
};
