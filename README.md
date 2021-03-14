# word-reference-api-tool

This is a simple tool which, for the given list of words, calls Word reference API and create/append json file with the information retrieved from the [http://wordreference.com/](http://wordreference.com/).

This tool uses [https://github.com/fega/wordreference-api](https://github.com/fega/wordreference-api)  

Usage:

1. npm install

2. node **wr-api-tool** *word-list-file json-result-file from-lang to-lang*

   Example:

   node **wr-api-tool** *c:\test\words_to_translate.txt* *c:\test\wordReferenceInfo.json* *it* *en*

Notes:

1. If the *json-result-file* already exists, new translations will be appended to that file if a word which we want to translate doesn't yet exist in *json-result-file*
2. in *word-list-file* the rule is **one word per line**
3. Possible language values for *from-lang* and *to-lang* are: it, en, es, de, fr, pt (+ some other which you can check directly on the wordreference site)