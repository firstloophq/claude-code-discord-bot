/**
 * Trigger a GitHub action.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param workflowId - The ID of the workflow to trigger.
 * @param ref - The ref to trigger the workflow on.
 * @param inputs - The inputs to pass to the workflow.
 * @returns The response from the GitHub API.
 */
export async function triggerGitHubAction(
    owner: string,
    repo: string,
    workflowId: string,
    ref: string = "main",
    inputs: Record<string, string> = {}
) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN environment variable is required");
    }

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
        {
            method: "POST",
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${token}`,
                "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({
                ref,
                inputs,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `GitHub API error: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    return response;
}
