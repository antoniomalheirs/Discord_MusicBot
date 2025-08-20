class PlayerErrorHandler {
    handleError(error) {
      console.error('Erro ao tocar:', error);
      // Send an error message to a log channel or inform the user
    }
  }
  
  module.exports = PlayerErrorHandler;
  