export interface DoshamExplanation {
  title: string;
  malayalamTitle: string;
  description: string;
  malayalamDescription: string;
}

export const DOSHAM_EXPLANATIONS: Record<string, DoshamExplanation> = {
  papasamyam: {
    title: "Papasamyam",
    malayalamTitle: "പാപസാമ്യം",
    description: "Papasamyam is the balancing of malefic influences (Papa Grahas) in the horoscopes of the bride and groom. It ensures that the intensity of planetary afflictions is similar in both charts, preventing one partner from being overwhelmed by the other's negative planetary positions.",
    malayalamDescription: "വരന്റെയും വധുവിന്റെയും ജാതകത്തിലെ പാപഗ്രഹങ്ങളുടെ (ചൊവ്വ, ശനി, രാഹു, കേതു, സൂര്യൻ) സ്വാധീനം തുല്യമാണോ എന്ന് പരിശോധിക്കുന്ന രീതിയാണിത്. ഒരാളുടെ ജാതകത്തിലെ ദോഷം മറ്റൊരാളുടെ ജാതകത്തിലെ ദോഷത്താൽ ശമിക്കപ്പെടുന്നു എന്ന് ഇത് ഉറപ്പുവരുത്തുന്നു."
  },
  chovvaDosham: {
    title: "Chovva Dosham (Kuja Dosham)",
    malayalamTitle: "ചൊവ്വാ ദോഷം",
    description: "Chovva Dosham occurs when Mars (Chovva) is placed in the 1st, 2nd, 4th, 7th, 8th, or 12th house of a horoscope. It is believed to cause friction, arguments, or health issues in married life unless matched with a partner who also has a similar Dosham.",
    malayalamDescription: "ജാതകത്തിൽ 1, 2, 4, 7, 8, 12 എന്നീ ഭാവങ്ങളിൽ ചൊവ്വ നിൽക്കുന്നതിനെയാണ് ചൊവ്വാ ദോഷം എന്ന് പറയുന്നത്. ഇത് ദാമ്പത്യത്തിൽ കലഹങ്ങൾക്കും തടസ്സങ്ങൾക്കും കാരണമായേക്കാം എന്ന് വിശ്വസിക്കപ്പെടുന്നു. സമാനമായ ദോഷമുള്ള ജാതകങ്ങൾ തമ്മിൽ ചേരുന്നത് ഈ ദോഷത്തെ ലഘൂകരിക്കും."
  },
  dasaSandhi: {
    title: "Dasa Sandhi",
    malayalamTitle: "ദശാസന്ധി",
    description: "Dasa Sandhi refers to the period when one major planetary period (Mahadasa) ends and another begins. If both partners undergo a Dasa Sandhi at the same time (within a gap of 6 months to 1 year), it is considered highly unfavorable as it can bring significant instability and challenges to the couple.",
    malayalamDescription: "രണ്ടുപേരുടെയും ജാതകത്തിൽ ഒരേ സമയം ദശ മാറുന്നതിനെയാണ് ദശാസന്ധി എന്ന് പറയുന്നത്. വിവാഹത്തിന് ശേഷം ഒരു വർഷത്തിനുള്ളിൽ രണ്ടുപേർക്കും ദശ മാറുന്നത് ദോഷകരമായി കണക്കാക്കുന്നു. ഇത് ജീവിതത്തിൽ വലിയ മാറ്റങ്ങൾക്കും അസ്ഥിരതയ്ക്കും കാരണമായേക്കാം."
  },
  madhamaranju: {
    title: "Madhamaranju",
    malayalamTitle: "മദമറഞ്ഞു ദോഷം",
    description: "Madhamaranju is a specific dosham related to the position of the Moon and other planets that might 'cloud' the judgment or mental peace of an individual. In compatibility, it is checked to ensure emotional stability and long-term mental harmony between the couple.",
    malayalamDescription: "മനസ്സിനെയും ചിന്തകളെയും സ്വാധീനിക്കുന്ന ഒരു പ്രത്യേക ദോഷമാണിത്. ദമ്പതികൾക്കിടയിൽ മാനസികമായ ഐക്യവും സമാധാനവും നിലനിർത്താൻ ഈ ദോഷം ഇല്ലാതിരിക്കുന്നത് നല്ലതാണ്. ഇത് വൈകാരികമായ പൊരുത്തത്തെ സൂചിപ്പിക്കുന്നു."
  }
};
