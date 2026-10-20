// conjugate.js — lightweight French verb conjugator
// Covers: regular -er / -ir / -re verbs (rule-based) + a dictionary of common irregulars.
// Tenses: présent, passé composé, imparfait, futur simple, conditionnel présent, subjonctif présent.
// Exposed as window.FrenchConjugate.analyze(word) -> null if not a recognized verb, else { infinitive, group, conjugations }

(function () {
  const PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils']; // index order matches UI pronoun labels

  // auxiliary "avoir" present tense, used to build passé composé for most verbs
  const AVOIR_PRESENT = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
  const ETRE_PRESENT = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'];

  // Verbs that take être in passé composé (the classic "Dr & Mrs Vandertramp" set) — simplified, no agreement handling
  const ETRE_VERBS = new Set([
    'aller', 'venir', 'arriver', 'partir', 'entrer', 'sortir', 'monter', 'descendre',
    'naître', 'mourir', 'retourner', 'rester', 'tomber', 'devenir', 'revenir', 'passer'
  ]);

  function conjugateRegularStem(stem, endings) {
    return PRONOUNS.map((_, i) => stem + endings[i]);
  }

  // ---- Regular verb patterns ----
  function regularER(stem) {
    const present = conjugateRegularStem(stem, ['e', 'es', 'e', 'ons', 'ez', 'ent']);
    const imparfaitStem = stem + 'i'; // -ions base uses "parl" + "ais" etc but stem for -er is same radical
    return {
      present,
      imparfaitStem: stem,
      futurStem: stem + 'er',
      pastParticiple: stem + 'é'
    };
  }
  function regularIR(stem) {
    const present = conjugateRegularStem(stem, ['is', 'is', 'it', 'issons', 'issez', 'issent']);
    return {
      present,
      imparfaitStem: stem + 'iss',
      futurStem: stem + 'ir',
      pastParticiple: stem + 'i'
    };
  }
  function regularRE(stem) {
    const present = conjugateRegularStem(stem, ['s', 's', '', 'ons', 'ez', 'ent']);
    return {
      present,
      imparfaitStem: stem,
      futurStem: stem, // "re" verbs drop final e before adding futur endings: vendre -> vendr + ai
      pastParticiple: stem + 'u'
    };
  }

  const IMPARFAIT_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
  const FUTUR_ENDINGS = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
  const COND_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];

  function buildFromParts(parts, auxVerbForPasseCompose) {
    const present = parts.present;
    const imparfait = PRONOUNS.map((_, i) => parts.imparfaitStem + IMPARFAIT_ENDINGS[i]);
    const futur = PRONOUNS.map((_, i) => parts.futurStem + FUTUR_ENDINGS[i]);
    const conditionnel = PRONOUNS.map((_, i) => parts.futurStem + COND_ENDINGS[i]);
    const subjonctif = parts.subjonctif || PRONOUNS.map((_, i) => {
      // default: subjonctif présent built off 3rd person plural présent stem for je/tu/il/ils, nous/vous use imparfait-like stem
      if (i === 3 || i === 4) {
        return parts.imparfaitStem + ['ions','iez'][i-3];
      }
      const stem3pl = present[5].replace(/ent$/, '');
      return stem3pl + ['e','es','e','','','ent'][i];
    });
    const aux = auxVerbForPasseCompose === 'etre' ? ETRE_PRESENT : AVOIR_PRESENT;
    const passeCompose = aux.map(a => a + ' ' + parts.pastParticiple);
    return { present, passeCompose, imparfait, futur, conditionnel, subjonctif };
  }

  // ---- Irregular verb dictionary (hand-written, common B1 verbs) ----
  const IRREGULARS = {
    'être': {
      present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
      passeCompose: ETRE_PRESENT.map(a => a + '... (uses avoir: "ai été")'), // placeholder overwritten below
      imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
      futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
      conditionnel: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
      subjonctif: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
      pastParticiple: 'été', aux: 'avoir'
    },
    'avoir': {
      present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
      imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
      futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
      conditionnel: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
      subjonctif: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
      pastParticiple: 'eu', aux: 'avoir'
    },
    'aller': {
      present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
      imparfait: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
      futur: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
      conditionnel: ['irais', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
      subjonctif: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
      pastParticiple: 'allé', aux: 'etre'
    },
    'faire': {
      present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
      imparfait: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
      futur: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
      conditionnel: ['ferais', 'ferais', 'ferait', 'ferions', 'feriez', 'feraient'],
      subjonctif: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
      pastParticiple: 'fait', aux: 'avoir'
    },
    'pouvoir': {
      present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'],
      imparfait: ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient'],
      futur: ['pourrai', 'pourras', 'pourra', 'pourrons', 'pourrez', 'pourront'],
      conditionnel: ['pourrais', 'pourrais', 'pourrait', 'pourrions', 'pourriez', 'pourraient'],
      subjonctif: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
      pastParticiple: 'pu', aux: 'avoir'
    },
    'vouloir': {
      present: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'],
      imparfait: ['voulais', 'voulais', 'voulait', 'voulions', 'vouliez', 'voulaient'],
      futur: ['voudrai', 'voudras', 'voudra', 'voudrons', 'voudrez', 'voudront'],
      conditionnel: ['voudrais', 'voudrais', 'voudrait', 'voudrions', 'voudriez', 'voudraient'],
      subjonctif: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
      pastParticiple: 'voulu', aux: 'avoir'
    },
    'devoir': {
      present: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'],
      imparfait: ['devais', 'devais', 'devait', 'devions', 'deviez', 'devaient'],
      futur: ['devrai', 'devras', 'devra', 'devrons', 'devrez', 'devront'],
      conditionnel: ['devrais', 'devrais', 'devrait', 'devrions', 'devriez', 'devraient'],
      subjonctif: ['doive', 'doives', 'doive', 'devions', 'deviez', 'doivent'],
      pastParticiple: 'dû', aux: 'avoir'
    },
    'venir': {
      present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
      imparfait: ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient'],
      futur: ['viendrai', 'viendras', 'viendra', 'viendrons', 'viendrez', 'viendront'],
      conditionnel: ['viendrais', 'viendrais', 'viendrait', 'viendrions', 'viendriez', 'viendraient'],
      subjonctif: ['vienne', 'viennes', 'vienne', 'venions', 'veniez', 'viennent'],
      pastParticiple: 'venu', aux: 'etre'
    },
    'prendre': {
      present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
      imparfait: ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'],
      futur: ['prendrai', 'prendras', 'prendra', 'prendrons', 'prendrez', 'prendront'],
      conditionnel: ['prendrais', 'prendrais', 'prendrait', 'prendrions', 'prendriez', 'prendraient'],
      subjonctif: ['prenne', 'prennes', 'prenne', 'prenions', 'preniez', 'prennent'],
      pastParticiple: 'pris', aux: 'avoir'
    }
  };
  // fix être's passé composé placeholder properly
  IRREGULARS['être'].passeCompose = AVOIR_PRESENT.map(a => a + ' été');

  function buildIrregular(def) {
    const aux = def.aux === 'etre' ? ETRE_PRESENT : AVOIR_PRESENT;
    const passeCompose = def.passeCompose || aux.map(a => a + ' ' + def.pastParticiple);
    return {
      present: def.present,
      passeCompose,
      imparfait: def.imparfait,
      futur: def.futur,
      conditionnel: def.conditionnel,
      subjonctif: def.subjonctif
    };
  }

  function stripArticlePrefixForVerbCheck(raw) {
    return raw.trim().toLowerCase();
  }

  function analyze(rawWord) {
    const word = stripArticlePrefixForVerbCheck(rawWord);
    // skip multi-word phrases that are clearly not a bare infinitive (e.g. "faire les courses")
    // but allow reflexive "se détendre" / "s'habituer à" by stripping the reflexive pronoun
    let infinitive = word;
    let reflexive = false;
    const reflMatch = word.match(/^(se |s')(.+)$/);
    if (reflMatch) {
      infinitive = reflMatch[2];
      reflexive = true;
    }
    // trim trailing " à" / " de" etc. and anything after first space for phrase-like entries,
    // but only if what's left still parses as a clean infinitive
    const firstWord = infinitive.split(/\s+/)[0];
    if (infinitive.includes(' ') && !IRREGULARS[infinitive]) {
      infinitive = firstWord;
    }

    if (IRREGULARS[infinitive]) {
      return {
        infinitive,
        group: 'irregular',
        conjugations: buildIrregular(IRREGULARS[infinitive])
      };
    }

    if (/er$/.test(infinitive) && infinitive.length > 2 && !/^(aller)$/.test(infinitive)) {
      const stem = infinitive.slice(0, -2);
      const parts = regularER(stem);
      return {
        infinitive,
        group: '-er',
        conjugations: buildFromParts(parts, 'avoir')
      };
    }
    if (/ir$/.test(infinitive) && infinitive.length > 2) {
      const stem = infinitive.slice(0, -2);
      const parts = regularIR(stem);
      return {
        infinitive,
        group: '-ir',
        conjugations: buildFromParts(parts, 'avoir')
      };
    }
    if (/re$/.test(infinitive) && infinitive.length > 2) {
      const stem = infinitive.slice(0, -2);
      const parts = regularRE(stem);
      return {
        infinitive,
        group: '-re',
        conjugations: buildFromParts(parts, 'avoir')
      };
    }
    return null; // not recognized as a verb
  }

  window.FrenchConjugate = { analyze };
})();
