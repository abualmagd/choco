"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRoutes = void 0;
const aws_1 = require("../plugins/aws");
const responseClasses_1 = require("../utils/responseClasses");
const FileRoutes = async (fastify, opt) => {
    fastify.post("/upload", async (request, reply) => {
        const { key } = request.query;
        const data = await request.file();
        if (!data) {
            return reply
                .status(400)
                .send(new responseClasses_1.ResError(500, "error no file", "error no file"));
        }
        if (data.file.bytesRead > Number(process.env.MAX_FILE_SIZE)) {
            return reply.status(413).send({
                error: `File exceeds maximum size of ${process.env.MAX_FILE_SIZE} bytes`,
            });
        }
        try {
            const myAws = new aws_1.MyAws();
            await myAws.uploadFile(data?.file, key, process.env.STORAGE_BUCKET);
            const url = process.env.BASE_URL + "api/storage/" + key;
            const res = new responseClasses_1.CustomResponse({ path: key, url: url }, null);
            return reply.status(200).send(JSON.stringify(res));
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.get("/storage/:key", async (request, reply) => {
        try {
            const { key } = request.params;
            // Validate key to prevent path traversal (e.g., "../../etc/passwd")
            if (key.includes("..") || !key.match(/^[a-zA-Z0-9\-_\/.]+$/)) {
                return reply.status(400).send({ error: "Invalid file key" });
            }
            const storageUrl = `https://${process.env.STORAGE_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
            const fileResponse = await fetch(storageUrl);
            if (!fileResponse.ok) {
                return reply.status(fileResponse.status).send({
                    error: "File not found or access denied",
                });
            }
            const contentType = fileResponse.headers.get("content-type") || "application/octet-stream";
            reply.headers({
                "Content-Type": contentType,
                "Content-Disposition": "inline", // Prevents download if not needed
                "Cache-Control": "public, max-age=86400", // Cache for 24h
                "X-Content-Type-Options": "nosniff", // Prevents MIME sniffing
                "Referrer-Policy": "strict-origin-when-cross-origin", // Limits referrer info
                "Cross-Origin-Resource-Policy": "cross-origin", // Allows cross-origin access
            });
            reply.send(fileResponse.body);
        }
        catch (error) {
            reply.send(error);
        }
    });
    fastify.post("/upload/product-image/:id", async (request, reply) => {
        const { key } = request.query;
        const { id } = request.params;
        const { altText } = request.body;
        const data = await request.file();
        if (!data) {
            return reply
                .status(400)
                .send(new responseClasses_1.ResError(500, "error no file", "error no file"));
        }
        if (data.file.bytesRead > Number(process.env.MAX_FILE_SIZE)) {
            return reply.status(413).send({
                error: `File exceeds maximum size of ${process.env.MAX_FILE_SIZE} bytes`,
            });
        }
        try {
            const myAws = new aws_1.MyAws();
            await myAws.uploadFile(data?.file, key, process.env.STORAGE_BUCKET);
            const url = process.env.BASE_URL + "api/storage/" + key;
            //const res = new CustomResponse({ path: key, url: url }, null);
            const productImage = await fastify.prisma.productImage.create({
                data: {
                    productId: parseInt(id),
                    url: url,
                    altText: altText,
                },
            });
            return reply.status(200).send(productImage);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.post("/upload/variant-image/:id", async (request, reply) => {
        const { key } = request.query;
        const { id } = request.params;
        const { altText } = request.body;
        const data = await request.file();
        if (!data) {
            return reply
                .status(400)
                .send(new responseClasses_1.ResError(500, "error no file", "error no file"));
        }
        if (data.file.bytesRead > Number(process.env.MAX_FILE_SIZE)) {
            return reply.status(413).send({
                error: `File exceeds maximum size of ${process.env.MAX_FILE_SIZE} bytes`,
            });
        }
        try {
            const myAws = new aws_1.MyAws();
            await myAws.uploadFile(data?.file, key, process.env.STORAGE_BUCKET);
            const url = process.env.BASE_URL + "api/storage/" + key;
            //const res = new CustomResponse({ path: key, url: url }, null);
            const productImage = await fastify.prisma.productImage.create({
                data: {
                    variantId: parseInt(id),
                    url: url,
                    altText: altText,
                },
            });
            return reply.status(200).send(productImage);
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.FileRoutes = FileRoutes;
