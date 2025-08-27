const { createClient } = require("@deepgram/sdk");

exports.default = async function (request) {
  try {
    // --- QUESTO CODICE PROVA SOLO DEEPGRAM ---
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const audioBuffer = await request.buffer();

    const { result, error: deepgramError } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      { model: "nova-2", language: "it" }
    );

    if (deepgramError) {
      throw new Error("Errore da Deepgram: " + deepgramError.message);
    }
    
    const transcribedText = result.results.channels[0].alternatives[0].transcript;

    // Se funziona, ti rimandiamo indietro il testo che abbiamo sentito.
    const responseData = {
      punti_salienti: [transcribedText || "Deepgram non ha sentito nulla."],
      cose_da_fare: [],
      appuntamenti: []
    };

    return new Response(JSON.stringify(responseData), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    // Se si rompe, ti mandiamo il messaggio di errore esatto.
    return new Response(
      JSON.stringify({ error: "ERRORE VERO: " + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
