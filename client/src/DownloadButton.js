import React from 'react';

class FileDownloadButton extends React.Component {
    // Function to handle the file download
    handleDownload = () => {
        // Define the content of the file
        const fileContent = 'This is the content of the file.';

        // Create a Blob object with the file content
        const blob = new Blob([fileContent], { type: 'text/plain' });

        // Create a temporary anchor element
        const anchorElement = document.createElement('a');

        // Set the href attribute to the Blob object
        anchorElement.href = URL.createObjectURL(blob);

        // Set the download attribute to specify the file name
        anchorElement.download = 'example.txt';

        // Simulate a click on the anchor element
        anchorElement.click();

        // Clean up resources
        URL.revokeObjectURL(anchorElement.href);
    };

    render() {
        return (
                <button className="report-button" onClick={this.handleDownload}>Download Report</button>
        );
    }
}

export default FileDownloadButton;