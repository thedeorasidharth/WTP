const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(cors());

// Ensure directories exist
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

ensureDirectoryExistence(path.join(__dirname, "uploads"));
ensureDirectoryExistence(path.join(__dirname, "files"));

// Setting up the file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        // Defining output file path
        let outputPath = path.join(__dirname, "files", `${req.file.originalname}.pdf`);

        docxToPDF(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.error("Error during conversion:", err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }

            res.download(outputPath, (downloadErr) => {
                if (downloadErr) {
                    console.error("Error during file download:", downloadErr);
                    return res.status(500).json({
                        message: "Error downloading the converted file",
                    });
                }
                console.log("File downloaded successfully");
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
