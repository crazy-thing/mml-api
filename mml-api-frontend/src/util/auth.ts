export const authenticateApiKey = async (apiKey: string, baseUrl: string) => {
    try {
        const res = await fetch (`${baseUrl}/authenticate`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey.toString(),
            }
        });


        if (res.status === 200) {
            localStorage.setItem("apiKey", apiKey);
            return true;
        }
    } catch (error) {
        console.error(`Error authenticating api key:  ${error}`);
    }
}