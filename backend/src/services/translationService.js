const { Translate } = require('@google-cloud/translate').v2;

class TranslationService {
  constructor() {
    this.translate = new Translate({
      projectId: process.env.GOOGLE_PROJECT_ID,
      key: process.env.GOOGLE_API_KEY,
    });
  }

  async translateText(text, from = 'en', to = 'vi') {
    try {
      const [translation] = await this.translate.translate(text, to);
      return translation;
    } catch (error) {
      throw new Error('Translation failed: ' + error.message);
    }
  }
}

module.exports = new TranslationService();