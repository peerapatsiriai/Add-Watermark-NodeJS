const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs').promises;

async function addWatermark(inputPath, outputPath, watermarkText) {
    // Read the PDF file
    const pdfBytes = await fs.readFile(inputPath);

    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the first page
    const page = pdfDoc.getPages()[0];

    // Add the watermark
    const fontSize = 48;
    const font = await pdfDoc.embedFont('Helvetica');
    const watermarkWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const watermarkHeight = font.heightAtSize(fontSize);

    const rotation = -Math.atan2(page.getWidth(), page.getHeight()) * (180 / Math.PI);

    const textWidthScaled = watermarkWidth * Math.cos(rotation * Math.PI / 180) + watermarkHeight * Math.sin(rotation * Math.PI / 180);
    const textHeightScaled = watermarkWidth * Math.sin(rotation * Math.PI / 180) + watermarkHeight * Math.cos(rotation * Math.PI / 180);

    page.drawText(watermarkText, {
        x: (page.getWidth() - textWidthScaled) / 2,
        y: (page.getHeight() - textHeightScaled) / 2,
        size: fontSize,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
        rotate: degrees(rotation),
    });

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();

    // Write the modified PDF to a new file
    await fs.writeFile(outputPath, modifiedPdfBytes);
}


const inputPath = 'test.pdf';
const outputPath = 'test-watermarked.pdf';
const watermarkText = 'RUMTL';

addWatermark(inputPath, outputPath, watermarkText)
    .then(() => console.log('Watermark added successfully!'))
    .catch(error => console.error('Error adding watermark:', error));
