const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === "/") {
        res.write("<html>");
        res.write("<head><title>My First Node.js Title .....</title></head>");
        res.write("<body style='background-color:red'>");
        res.write("<form action='/message' method='POST'><input type='text' name='message'></input><button type='submit'>Send</button></form>")
        res.write("</body>");
        res.write("</html>");
        return res.end();
    }

    if (url === '/message' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1];
            fs.writeFile('message.txt', message, err => {
                res.statusCode = 302;
                res.setHeader('Location', '/');
                return res.end();
            });
        });
    }

    res.setHeader('content-type', 'text/html');
    res.write("<html>");
    res.write("<head><title>My First Node.js Title .....</title></head>");
    res.write("<body style='background-color:pink'>");
    res.write("<h1 style='color:red'>Hello, This is the Server...!</h1>")
    res.write("</body>");
    res.write("</html>");
    res.end();
}
exports.handler = requestHandler;
exports.sometext = 'some random text';