import { Image, loadImage } from "canvas";

export interface ImageBounds {
    image: Image;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

export function checkCollision(bounds1: ImageBounds, bounds2: ImageBounds, padding = 100): boolean {
    return !(
        bounds1.x + bounds1.width + padding < bounds2.x ||
        bounds2.x + bounds2.width + padding < bounds1.x ||
        bounds1.y + bounds1.height + padding < bounds2.y ||
        bounds2.y + bounds2.height + padding < bounds1.y
    );
}

export async function findNonOverlappingPosition(
    imagePath: string,
    chartX: number,
    chartY: number,
    chartWidth: number,
    chartHeight: number,
    placedImages: ImageBounds[],
    maxAttempts = 50
): Promise<ImageBounds | null> {
    const image = await loadImage(imagePath);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const scale = 0.2 + Math.random() * 0.15;

        const imageAspect = image.width / image.height;

        let drawWidth = chartWidth * scale;
        let drawHeight = drawWidth / imageAspect;

        const maxHeight = chartHeight * 0.3;
        if (drawHeight > maxHeight) {
            drawHeight = maxHeight;
            drawWidth = drawHeight * imageAspect;
        }

        const maxX = chartX + chartWidth - drawWidth;
        const maxY = chartY + chartHeight - drawHeight;
        const drawX = chartX + Math.random() * (maxX - chartX);
        const drawY = chartY + Math.random() * (maxY - chartY);
        const rotation = (Math.random() - 0.7) * (Math.PI / 3);

        const bounds: ImageBounds = {
            image,
            x: drawX,
            y: drawY,
            width: drawWidth,
            height: drawHeight,
            rotation,
        };

        const hasCollision = placedImages.some((placed) => checkCollision(bounds, placed));

        if (!hasCollision) {
            return bounds;
        }
    }

    console.warn(`Could not find non-overlapping position for ${imagePath} after ${maxAttempts} attemps.`);
    return null;
}
