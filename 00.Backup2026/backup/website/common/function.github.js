const commitMessage = "This is a commit message";
const fileName = "file.txt";
const fileContent = "Hello, World!\n";
const branchName = "main";
const ownerName = "your_username";
const repoName = "your_repository";
const token = "YOUR_PERSONAL_ACCESS_TOKEN";

const apiUrl = `https://api.github.com/repos/${ownerName}/${repoName}/contents/${fileName}`;

$.ajax({
    url: apiUrl,
    method: "GET",
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function(response) {
        const sha = response.sha;
        const content = btoa(fileContent);

        const data = {
            message: commitMessage,
            content: content,
            sha: sha,
            branch: branchName
        };

        $.ajax({
            url: apiUrl,
            method: "PUT",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            },
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function(response) {
                console.log("Commit created!");
            },
            error: function(xhr, textStatus, errorThrown) {
                console.error(errorThrown);
            }
        });
    },
    error: function(xhr, textStatus, errorThrown) {
        if (xhr.status === 404) {
            const content = btoa(fileContent);

            const data = {
                message: commitMessage,
                content: content,
                branch: branchName
            };

            $.ajax({
                url: apiUrl,
                method: "PUT",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                },
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(data),
                success: function(response) {
                    console.log("Commit created!");
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.error(errorThrown);
                }
            });
        }
    }
});