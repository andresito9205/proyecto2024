module.exports = {
    version: '10.51.10', // La versión de Botpress que estás utilizando
    botUrl: 'http://localhost:3001', // La URL donde se ejecuta tu bot
    language: 'es', // Idioma predeterminado del bot
  
    // Configuración del servidor web (si es necesario)
    server: {
      port: 3000,
      // Otros ajustes del servidor...
    },
  
    // Configuración del canal (por ejemplo, si estás usando Facebook Messenger)
    channels: {
      messenger: {
        // Configuración específica de Messenger...
      },
      // Otros canales...
    },
  
    // Configuración del procesamiento del lenguaje natural (NLP)
    nlu: {
      enabled: true,
      models: {
        // Configuración de modelos NLU...
      },
    },
  
    // Configuración de almacenamiento (por ejemplo, si estás utilizando SQLite)
    storage: {
      // Configuración de almacenamiento...
    },
  
    // Otras configuraciones específicas de tu bot...
  };
  