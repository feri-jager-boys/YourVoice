export const generateHTML = (content: string) => {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;  // Links
    const imagePattern = /!\[([^\]]+)\]\(([^)]+)\)/g;  // Images
    const blockCodePattern = /```([^`]+)```/gs;  // Code blocks
    const boldPattern = /\*\*([^\*]+)\*\*/g;  // Bold text
    const italicPattern = /\*([^\*]+)\*/g;  // Italic text
    const iframePattern = /!\(([^)]+)\)/g;  // Iframe pattern (matches !(URL))

    return content
        .replace(imagePattern, '<img src="$2" alt="$1">')
        .replace(linkPattern, '<a class="user-provided-link" href="$2">$1</a>')
        .replace(blockCodePattern, '<pre><code>$1</code></pre>')
        .replace(boldPattern, '<strong>$1</strong>')
        .replace(italicPattern, '<em>$1</em>')
};
