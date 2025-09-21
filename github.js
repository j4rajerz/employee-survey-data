const GITHUB_TOKEN = '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';
const REPO_OWNER = 'j4rajerz';
const REPO_NAME = 'employee-survey-data';
const FILE_PATH = 'data.json';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

async function getData() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Cache-Control': 'no-cache'
            }
        });
        if (response.status === 404) {
            // File doesn't exist, create it with default data
            const defaultData = {
                assistants: [],
                criteria: [],
                surveyData: {
                    pageViews: 0,
                    completedSurveys: 0,
                    responses: []
                }
            };
            await updateData(defaultData, 'Initial commit');
            return defaultData;
        }
        const data = await response.json();
        return JSON.parse(atob(data.content));
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function updateData(data, message) {
    try {
        let sha;
        try {
            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Cache-Control': 'no-cache'
                }
            });
            if (response.ok) {
                const existingFile = await response.json();
                sha = existingFile.sha;
            }
        } catch (error) {
            // Ignore error if file doesn't exist
        }

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
        const body = {
            message: message,
            content: content,
            sha: sha
        };

        await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.error('Error updating data:', error);
    }
}
