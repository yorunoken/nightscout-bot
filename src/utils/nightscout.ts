export interface Entry {
    type: string;
    dateString: string;
    date: number;
    sgv: number;
    direction: string;
    noise?: number;
    filtered?: number;
    unfiltered?: number;
    rssi?: number;
}

export async function getGlucoseValues(hours: number): Promise<Array<number>> {
    const url = `${process.env.NIGHTSCOUT_URL}/api/v1/entries?count=${hours * 12}`;

    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const entries = (await response.json()) as Array<Entry>;

    let glucoseList = entries.map((x) => x.sgv);
    glucoseList.reverse();

    return glucoseList;
}
