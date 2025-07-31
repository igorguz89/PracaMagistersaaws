// Ten plik centralizuje konfigurację punktów końcowych API.


const API_BASE_URL = "https://gie4hdwqw8.execute-api.eu-north-1.amazonaws.com/prod";

export const apiConfig = {
    getUsers: `${API_BASE_URL}/GET_DATA`,
    postUser: `${API_BASE_URL}/POST`,
    deleteUsers: `${API_BASE_URL}/Delete_Users`,
    postTemplate: `${API_BASE_URL}/POSTTAMPLATE`,
    getTemplates: `${API_BASE_URL}/GETTEMPLATE`,
    deleteTemplate: `${API_BASE_URL}/DELETETEMPLATE`,
};