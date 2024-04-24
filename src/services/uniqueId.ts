export const generateUniqueFormID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueID = '';
  
    // Generate 2 random characters
    for (let i = 0; i < 2; i++) {
      uniqueID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    // Generate 3 random numbers
    for (let i = 0; i < 3; i++) {
      uniqueID += Math.floor(Math.random() * 10);
    }
  
    return uniqueID;
  };
  