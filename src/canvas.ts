import { createCanvas, CanvasRenderingContext2D } from "canvas";
import fs from "fs";
import { generateTimeIncrements, shuffleArray } from "./utils/maths";
import { findNonOverlappingPosition, type ImageBounds } from "./utils/collisions";

const IMAGES_PATH = "./pics";

const CANVAS_WIDTH = 2500;
const CANVAS_HEIGHT = 1500;
const FONT = "Arial";

export async function drawChart(glucoseList: number[], hours: number): Promise<Buffer> {
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const totalPoints = hours * 12;

    const margin = 60;
    const labelAreaSize = 120;
    const rightLabelAreaSize = 100;

    const chartX = margin + labelAreaSize;
    const chartY = margin;
    const chartWidth = CANVAS_WIDTH - margin - labelAreaSize - rightLabelAreaSize - margin;
    const chartHeight = CANVAS_HEIGHT - margin * 2;

    const xPadding = Math.ceil(totalPoints * 0.03);
    const xMin = -totalPoints - xPadding;
    const xMax = 0 + xPadding;

    const dataMin = Math.min(40, ...glucoseList);
    const dataMax = Math.max(220, ...glucoseList);

    const yMin = Math.min(40, Math.floor(dataMin / 10) * 10);
    const yMax = Math.ceil(dataMax / 10) * 10;

    const yPadding = (yMax - yMin) * 0.06;
    const yMinPadded = yMin - yPadding;
    const yMaxPadded = yMax + yPadding;

    const yMinSecondary = yMin / 18.0;
    const yMaxSecondary = yMax / 18.0;
    const ySecondaryPadding = (yMaxSecondary - yMinSecondary) * 0.06;
    const yMinSecondaryPadded = yMinSecondary - ySecondaryPadding;
    const yMaxSecondaryPadded = yMaxSecondary + ySecondaryPadding;

    const xToPixel = (x: number) => chartX + ((x - xMin) / (xMax - xMin)) * chartWidth;
    const yToPixel = (y: number) => chartY + chartHeight - ((y - yMinPadded) / (yMaxPadded - yMinPadded)) * chartHeight;
    const ySecondaryToPixel = (y: number) => chartY + chartHeight - ((y - yMinSecondaryPadded) / (yMaxSecondaryPadded - yMinSecondaryPadded)) * chartHeight;

    // Images
    await drawRandomImages(ctx, chartX, chartY, chartWidth, chartHeight, 3);
    //

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "white";
    ctx.font = `bold 42px ${FONT}`;

    // Y-axis grid (mg/dl)
    for (let y = yMin; y <= yMax; y += 20) {
        const pixelY = yToPixel(y);
        ctx.beginPath();
        ctx.moveTo(chartX, pixelY);
        ctx.lineTo(chartX + chartWidth, pixelY);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.fillText(y.toFixed(), chartX - 10, pixelY + 8);
    }

    // Secondary Y-axis grid (mmol/L)
    for (let y = yMinSecondary; y <= yMaxSecondary; y += 1) {
        ctx.textAlign = "left";
        ctx.fillText(y.toFixed(), chartX + chartWidth + 10, ySecondaryToPixel(y) + 8);
    }

    let timeIncrements = generateTimeIncrements(hours);

    timeIncrements.forEach((timeHours) => {
        const x = timeHours * 12;
        const pixelX = xToPixel(x);
        ctx.textAlign = "center";
        ctx.fillText(`${timeHours.toFixed(1)}h`, pixelX, chartY + chartHeight + 40);
    });

    // Axis labels
    ctx.font = `bold 36px ${FONT}`;
    ctx.textAlign = "center";

    ctx.save();
    ctx.translate(40, chartY + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("MG/DL", 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(CANVAS_WIDTH - 40, chartY + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("MMOL/L", 0, 0);
    ctx.restore();

    glucoseList.forEach((glucose, index) => {
        const x = -totalPoints + index;
        const pixelX = xToPixel(x);
        const pixelY = yToPixel(glucose);

        let color: string;
        if (glucose > 180) {
            color = "#FF0000";
        } else if (glucose > 150) {
            color = "#FFA500";
        } else if (glucose > 70) {
            color = "#87CEEB";
        } else if (glucose > 55) {
            color = "#FF0000";
        } else {
            color = "#8B0000";
        }

        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    });

    return canvas.toBuffer("image/png");
}

async function drawRandomImages(ctx: CanvasRenderingContext2D, chartX: number, chartY: number, chartWidth: number, chartHeight: number, imagesAmount = 3) {
    const imagesFiles = fs.readdirSync(IMAGES_PATH).filter((file) => file.endsWith(".png"));
    const numbers = Array.from({ length: imagesFiles.length }, (_, i) => i + 1);
    shuffleArray(numbers);
    const selectedNumbers = numbers.slice(0, imagesAmount);

    const placedImages: Array<ImageBounds> = [];
    for (const num of selectedNumbers) {
        const imagePath = `${IMAGES_PATH}/${num}.png`;
        const bounds = await findNonOverlappingPosition(imagePath, chartX, chartY, chartWidth, chartHeight, placedImages);

        if (bounds) {
            await drawImageAtPosition(ctx, bounds);
            placedImages.push(bounds);
        }
    }
}

async function drawImageAtPosition(ctx: CanvasRenderingContext2D, bounds: ImageBounds) {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    ctx.save();

    ctx.globalAlpha = 0.6;
    ctx.translate(centerX, centerY);
    ctx.rotate(bounds.rotation);
    ctx.drawImage(bounds.image, -bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);

    ctx.restore();
}
