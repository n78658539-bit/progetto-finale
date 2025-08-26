const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@deepgram/sdk");

exports.default = async function (request) {
  try {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const audioBuffer = await request.buffer();

    const { result, error: deepgramError } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      { model: "nova-2", language: "it", smart_format: true }
    );

    if (deepgramError) throw new Error("Errore da Deepgram: " + deepgramError.message);
    
    const transcribedText = result.results.channels[0].alternatives[0].transcript;

    if (!transcribedText) {
      return new Response(
        JSON.stringify({ punti_salienti: [], cose_da_fare: [], appuntamenti: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Dato il testo, estrai un JSON con: "punti_salienti" (array di stringhe), "cose_da_fare" (array di stringhe), "appuntamenti" (array di oggetti con "descrizione"). Testo: "${transcribedText}"`;

    const resultGemini = await model.generateContent(prompt);
    const jsonText = resultGemini.response.text();

    return new Response(jsonText, { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
