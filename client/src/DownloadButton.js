import React from 'react';

class FileDownloadButton extends React.Component {


     getReport = async () => {
        try{
            const response = await fetch('/getReport', {
                method: "GET"
            });
            console.log("Trying to get report data");
            if(response.status === 200) {
                const {reportContent} = await response.json();
                return reportContent;
            } else {
                console.log("Error - API response for getting report - " + response.status);
            }
        } catch (e){
            console.log("Could not get report due to "+ e);
        }
        alert("Report could not be generated.");
    }



    // Function to handle the file download
    handleDownload = async () => {
        // Define the content of the file
        const fileContent = await this.getReport();
        if (!fileContent) {
            return;
        }

        // Create a Blob object with the file content
        const blob = new Blob([fileContent], {type: 'text/plain'});

        // Create a temporary anchor element
        const anchorElement = document.createElement('a');

        // Set the href attribute to the Blob object
        anchorElement.href = URL.createObjectURL(blob);

        // Set the download attribute to specify the file name
        anchorElement.download = 'medicalReport.txt';

        // Simulate a click on the anchor element
        anchorElement.click();

        // Clean up resources
        URL.revokeObjectURL(anchorElement.href);
    };

    render() {
        const { onClick } = this.props;
        return (
                <button 
                className="report-button" 
                onClick={() => {
                    onClick();
                    this.handleDownload();
                  }}
                >
                    Download Report</button>
        );
    }
}

export default FileDownloadButton;