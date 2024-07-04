//create a utility function to send response to the client
export default function ApiResponse(res, status, message, data = null) {
    res.status(status).json({
      message,
      data,
      error: status >= 400, // Flag for client-side error handling
    });
  }
  

   