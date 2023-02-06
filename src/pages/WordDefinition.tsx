import React from "react";
import { nanoid } from "nanoid";
import axios from "axios";

interface Props {
  path: string;
  error: {
    error: boolean;
    errorMsg: string;
    fetchError: boolean;
  };
  setError: React.Dispatch<
    React.SetStateAction<{
      error: boolean;
      errorMsg: string;
      fetchError: boolean;
    }>
  >;
}

type WordData = {
  word: string;
  phonetic: string;
  audio: string;
  meanings: Meaning[];
};

type Meaning = {
  partOfSpeech: string;
  definitions: Array<{
    definition?: string;
    example?: string;
  }>;
  synonyms?: string[];
};

const WordDefinition: React.FC<Props> = ({ path, error, setError }: Props) => {
  // state for search word information
  const [wordData, setWordData] = React.useState<WordData>({
    word: "",
    phonetic: "",
    audio: "",
    meanings: [],
  });
  // state for the sound
  const [sound, setSound] = React.useState(new Audio());
  // state used to display loading animation during fetch request
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const options = {
    method: "GET",
    url: "/api",
    params: { word: path },
  };

  // every time path changes, updates state of loading to true. If fetch request is successful then state of "wordData" is updated accordingly, "loading" is set to false, resets "error".
  // If fetch is failed - catches error, and updates state of the "error"
  React.useEffect(() => {
    setIsLoading(true);

    axios
      .request(options)
      .then((response) => {
        const dataElement = response.data.results[0].lexicalEntries;
        const meanings: Meaning[] = [];

        for (let entry of dataElement) {
          const definitions: { definition: string; example?: string }[] = [];
          const synonyms: string[] = [];

          for (let definition of entry.entries[0].senses) {
            if (definition.definitions) {
              definitions.push({
                definition: definition.definitions[0],
                ...(definition.examples && { example: definition.examples[0].text }),
              });
            }

            if (definition.synonyms) {
              for (let synonym of definition.synonyms) {
                synonyms.push(synonym.text);
              }
            }
          }

          meanings.push({
            partOfSpeech: entry.lexicalCategory.id,
            definitions: definitions,
            ...(synonyms.length !== 0 && { synonyms: synonyms }),
          });
        }

        setWordData({
          word: dataElement[0].text,
          phonetic: dataElement[0].entries[0].pronunciations[0].phoneticSpelling,
          audio: dataElement[0].entries[0].pronunciations[1].audioFile,
          meanings: meanings,
        });
        setIsLoading(false);
        setError({
          error: false,
          errorMsg: "",
          fetchError: false,
        });
      })
      .catch((e) => {
        console.log(e);
        setError({
          error: true,
          errorMsg: "Server responds with error!",
          fetchError: true,
        });
      });
  }, [path]);

  /**handles click on audio button. Stops the audio, then creates new istance of audio, plays it and then updates state of the "sound" */
  function handleAudio(url: string) {
    sound.pause();
    const newSound = new Audio(url);
    newSound.play();
    setSound(newSound);
  }

  return !isLoading ? (
    <main className="main">
      <header className="main-header">
        <h1 className="main-header__title">{wordData.word}</h1>
        {wordData.phonetic && <h3 className="main-header__sub">{wordData.phonetic}</h3>}
        {wordData.audio !== "" && (
          <button className="main-header__play-btn" onClick={() => handleAudio(wordData.audio)}>
            <i className="fa-solid fa-play main-header__play-btn__icon"></i>
          </button>
        )}
      </header>

      {wordData.meanings.map((meaning) => {
        return (
          <section className="section" key={nanoid()}>
            <header className="section-header">
              <h4 className="section-header__title">{meaning.partOfSpeech}</h4>
              <div className="section-header__line"></div>
            </header>

            {meaning.definitions.length !== 0 && (
              <article className="article">
                <h4 className="article__title">Meaning</h4>
                <ul className="article__list">
                  {meaning.definitions.map((definition) => {
                    return (
                      <li className="article__list__item" key={nanoid()}>
                        {definition.definition}
                        {definition.example && (
                          <p className="article__list__item__example">{`"${definition.example}"`}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {meaning.synonyms && (
                  <div className="article__synonyms">
                    <h4 className="article__synonyms__title">Synonyms</h4>
                    <ul className="synonyms-list">
                      {meaning.synonyms.map((synonym) => {
                        return (
                          <li className="synonyms-list__item" key={nanoid()}>
                            {synonym}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </article>
            )}
          </section>
        );
      })}
    </main>
  ) : (
    <div className="loading-animation">
      {!error.fetchError && (
        <>
          {" "}
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </>
      )}
    </div>
  );
};
export default WordDefinition;
