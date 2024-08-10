<template>
<section class="section">
<div class="container">
    <div class="block" style="display: flex; align-items: center;">
      <h1 class="is-size-4 has-text-weight-bold" style="flex: 1;">Брайль <sup>β</sup></h1>
      <div class="menu" style="display: flex; align-items: center; gap: 20px;">
        <!-- <div>
          <a href="/">Генератор</a>
        </div> -->
        <div>
          <a href="https://blog.alexkolodko.com/all/braille-generator/" target="_blank">Про проєкт ↗</a>
        </div>
      </div>
    </div>
    <div class="block">
      <label for="iptText">Текст:</label>
      <div class="textarea-container">
        <textarea class="textarea is-medium" id="iptText" v-model="textInput" @input="generateBrailleText" placeholder="Введіть текст…"></textarea>
        <button class="button is-small mini-button" @click="eraseTextarea" title="Очистити текст">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
    <div class="block ">
      <label for="iptBraille">Текст Брайлем (Unicode):</label>
      <div class="textarea-container">
        <textarea class="textarea is-medium" id="iptBraille" v-model="brailleOutput" :title="tooltipText" readonly></textarea>
        <button class="button is-small mini-button" @click="copyToClipboard" :title="tooltipText">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
              <path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"/>
            </svg>
          </span>
        </button>
      </div>
      <!-- <textarea class="textarea is-medium" id="iptBraille" v-model="brailleOutput" @click="copyToClipboard" :title="tooltipText" readonly></textarea> -->
      <!-- <div
        id="iptBraille"
        class="braille-output"
        v-html="brailleOutput"
        @click="copyToClipboard"
        :title="tooltipText"
      ></div> -->
    </div>
    <div class="block"> <!-- v-if="textInput.trim() && svgWidth > 0" -->
      <div class="mb-1">
        У векторі. Фізичний розмір: <span v-if="textInput.length > 0"><b>{{ this.svgWidth }}×{{ this.svgHeight }} мм</b></span><span v-else>…</span>. Діаметр: <b>{{this.dotSize * 2}} мм</b>, відстань між точками: <b>{{this.dotSpacing}} мм</b>, між символами <b>{{this.letterSpacing}} мм</b>, між рядків <b>{{this.lineSpacing}} мм</b>.
        <label class="checkbox ml-2">
          <input  type="checkbox" 
                  v-model="addPadding"
                  />
          + {{this.svgPadding6}} мм відступ
        </label>
        <!-- <label class="checkbox ml-2">
          <input  type="checkbox" 
                  v-model="addStarter"
                  />
          + D
        </label> -->
      </div>
      <div class="block box svgPreviewbox">
        <svg
        id="svgBraille"
        :innerHTML="svgContent"
        :width="svgWidth * scale"
        :height="svgHeight * scale"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        :style="{ border: addPadding ? '1px lightgrey dashed' : '' }"
        ></svg>
      </div>
      <div class="buttons">
        <button class="button is-warning" :class="{ 'is-fullwidth': isMobile }" @click="downloadSvg" :disabled="!textInput.trim()">Завантажити SVG</button>
        <button class="button is-warning" :class="{ 'is-fullwidth': isMobile }" @click="downloadPdf" :disabled="!textInput.trim()">Завантажити PDF</button>
      </div>
    </div>
  </div>
</section>
<footer>
    <p class="build-num"><a href="https://github.com/alexkolodko/braille-generator" target="_blank">Проєкт на Github</a> · Версія: {{ buildNumber }}, {{ buildDate }}</p>
  </footer>
</template>

<script>
// SVG 2 PDF converter
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
// import 'clipboard/dist/clipboard.min.js';

export default {
  data() {
    return {
      textInput: "",
      brailleOutput: "",
      svgContent: "",
      svgWidth: 0, // Initial width
      svgHeight: 0, // Initial height
      svgPadding: 0,
      svgPadding6: 6,
      svgXStart: 0,
      svgYStart: 0,
      scale: 5.67, // 1.5 mm in pixels (assuming 96 DPI)
      isMobile: false,
      dotSpacing: 2.5,
      letterSpacing: 7,
      dotSize: 0.75,
      lineSpacing: 11,
      shapeMarginRight: 0,
      shapeMarginBottom: 0,
      brailleToShape: {
        " ": " ",
        "\n": "\n",
        "⠁": "1",
        "⠂": "2",
        "⠃": "12",
        "⠄": "3",
        "⠅": "13",
        "⠆": "23",
        "⠇": "123",
        "⠈": "4",
        "⠉": "14",
        "⠊": "24",
        "⠋": "124",
        "⠌": "34",
        "⠍": "134",
        "⠎": "234",
        "⠏": "1234",
        "⠐": "5",
        "⠑": "15",
        "⠒": "25",
        "⠓": "125",
        "⠔": "35",
        "⠕": "135",
        "⠖": "235",
        "⠗": "1235",
        "⠘": "45",
        "⠙": "145",
        "⠚": "245",
        "⠛": "1245",
        "⠜": "345",
        "⠝": "1345",
        "⠞": "2345",
        "⠟": "12345",
        "⠠": "6",
        "⠡": "16",
        "⠢": "26",
        "⠣": "126",
        "⠤": "36",
        "⠥": "136",
        "⠦": "236",
        "⠧": "1236",
        "⠨": "46",
        "⠩": "146",
        "⠪": "246",
        "⠫": "1246",
        "⠬": "346",
        "⠭": "1346",
        "⠮": "2346",
        "⠯": "12346",
        "⠰": "56",
        "⠱": "156",
        "⠲": "256",
        "⠳": "1256",
        "⠴": "356",
        "⠵": "1356",
        "⠶": "2356",
        "⠷": "12356",
        "⠸": "456",
        "⠹": "1456",
        "⠺": "2456",
        "⠻": "12456",
        "⠼": "3456",
        "⠽": "13456",
        "⠾": "23456",
        "⠿": "123456"
      },
      textToBraille: {
        " ": " ",
        "\n": "\n",
        "a": "⠁",
        "b": "⠃",
        "c": "⠉",
        "d": "⠙",
        "e": "⠑",
        "f": "⠋",
        "g": "⠛",
        "h": "⠓",
        "i": "⠊",
        "j": "⠚",
        "k": "⠅",
        "l": "⠇",
        "m": "⠍",
        "n": "⠝",
        "o": "⠕",
        "p": "⠏",
        "q": "⠟",
        "r": "⠗",
        "s": "⠎",
        "t": "⠞",
        "u": "⠥",
        "v": "⠧",
        "w": "⠺",
        "x": "⠭",
        "y": "⠽",
        "z": "⠵",
        "#": "⠼",
        "1": "⠁",
        "2": "⠃",
        "3": "⠉",
        "4": "⠙",
        "5": "⠑",
        "6": "⠋",
        "7": "⠛",
        "8": "⠓",
        "9": "⠊",
        "0": "⠚",
        // Punctuation        
        ",": "⠂",
        ".": "⠲",
        ":": "⠒",
        "!": "⠖",
        "?": "⠢",
        ";": "⠆",
        "-": "⠤",
        "–": "⠤",
        "—": "⠤",
        "−": "⠤",
        "+": "⠖",
        "÷": "⠲",
        "×": "⠌",
        "«": "⠦",
        "»": "⠴",
        "“": "⠦",
        "”": "⠴",
        "(": "⠶",
        ")": "⠶",
        "*": "⠔",
        "=": "⠶",
        "/": "⠌",
        "@": "⠩",
        "№": "⠝",
        "<": "⠪",
        ">": "⠕",
        "&": "⠯",
        "%": "⠼⠚⠴",
        "[": "⠷",
        "]": "⠾",
        "{": "⠯",
        "}": "⠽",
        "\\": "⠡",
        // Ukrainian characters
        "а": "⠁",
        "б": "⠃",
        "в": "⠺",
        "г": "⠛",
        "ґ": "⠻",
        "д": "⠙",
        "е": "⠑",
        "є": "⠜",
        "ж": "⠚",
        "з": "⠵",
        "и": "⠊",
        "і": "⠽",
        "ї": "⠹",
        "й": "⠯",
        "к": "⠅",
        "л": "⠇",
        "м": "⠍",
        "н": "⠝",
        "о": "⠕",
        "п": "⠏",
        "р": "⠗",
        "с": "⠎",
        "т": "⠞",
        "у": "⠥",
        "ф": "⠋",
        "х": "⠓",
        "ц": "⠉",
        "ч": "⠟",
        "ш": "⠱",
        "щ": "⠭",
        "ь": "⠾",
        "ю": "⠳",
        "я": "⠫",
      },
      dotStyles: [
        "fill: black;",
        "fill: none; stroke: black; stroke-width: 0.15;",
        "fill: #333;",
        "fill: #666;"
      ],
      selectedDotStyleIndex: 0, // Index of the currently selected dot style
      tooltipText: 'Клацніть, щоб скопіювати',
      storageKey: 'brailleConverterTextInput',
      addPadding: false,
      addStarter: false,
      buildNumber: process.env.VUE_APP_BUILD_NUMBER,
      buildDate: process.env.VUE_APP_BUILD_DATE,
    };
  },
  created() {
    // Load text input from localStorage if available
    const savedTextInput = localStorage.getItem(this.storageKey);
    if (savedTextInput) {
      this.textInput = savedTextInput;
    } else {
      this.textInput = this.$route.query.textInput || "";
    }
    this.generateBrailleText();
  },
  watch: {
    textInput: {
      handler(newValue) {
        // Save text input to localStorage whenever it changes
        localStorage.setItem(this.storageKey, newValue);
        if (newValue) {
          this.$router.push({ path: "/", query: { textInput: newValue } });
        } else {
          this.$router.push({ path: "/" });
        }
      },
      deep: true
    },
    '$route.query.textInput'(newTextInput) {
      this.textInput = newTextInput || "";
      this.generateBrailleText();
    },
  },
  mounted() {

    this.shapeMarginRight = 0;
    this.shapeMarginBottom = 0;
    this.svgXStart = this.dotSize; 
    this.svgYStart = this.dotSize;
    // Test data 
    // this.textInput = "Кабінет лікувальної фізіотерапії";
    // this.generateBrailleText();
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  updated(){
    this.svgPadding = this.addPadding ? this.svgPadding6 : 0;
    this.generateSvg();
  },
  methods: {
    generateBrailleText() {
      let input = this.textInput;
      let result = "";
      let isPreviousCharDigit = false;

      for (let i = 0; i < input.length; i++) {
          let char = input[i];

          // Convert double quotes to open and close quotes
          if (char === '"') {
              if (i === input.length - 1) {
                  result += "⠴"; // Close quote if it's at the end of the text
              } else if (i === 0 || input[i - 1] !== '"') {
                  result += "⠦"; // Open quote
              } else {
                  result += "⠴"; // Close quote
              }
          } else if (/\d/.test(char)) {
              if (!isPreviousCharDigit) {
                  result += "⠼"; // Add Braille number sign before the first digit in a group
              }
              isPreviousCharDigit = true;
          } else {
              isPreviousCharDigit = false;
          }

          if (char === "\n") {
              result += "\n"; // Preserve newline characters
          } else {
              if (char >= 'A' && char <= 'Z' || (char >= 'А' && char <= 'Я' || char === 'І' || char === 'Ї' || char === 'Є' || char === 'Ґ')) {
                  result += "⠘"; // Prefix for uppercase letter
                  char = char.toLowerCase(); // Convert to lowercase for the braille dictionary lookup
              }

              if (Object.prototype.hasOwnProperty.call(this.textToBraille, char)) {
                  result += this.textToBraille[char];
              }
          }
      }
      this.brailleOutput = result;
      this.generateSvg();
    },

    generateSvg() {
      let input = this.brailleOutput;
      let result = "";
      for (let char of input) {
        if (Object.prototype.hasOwnProperty.call(this.brailleToShape, char)) {
          result += char;
        }
      }
      input = result;
      this.svgContent = this.createSvgContent(input);
      this.updateSvgSize(input);
    },
    createSvgContent(input) {
      let xStart = this.svgXStart + this.svgPadding;
      let yStart = this.svgYStart + this.svgPadding;
      let x = xStart;
      let y = yStart;
      let svgElements = [];

      for (let char of input) {
        if (char === "\n") {
          y += this.lineSpacing;
          x = xStart;
        } else if (char === " ") {
          x += this.letterSpacing;
        } else {
          let shape = this.brailleToShape[char];
          for (let dot of shape) {
            dot = parseInt(dot);
            let cx = dot > 3 ? this.dotSpacing : 0;
            let cy = ((dot - 1) % 3) * this.dotSpacing;
            svgElements.push(
              `<circle style="${this.dotStyles[this.selectedDotStyleIndex]}" cx="${x + cx}" cy="${y + cy}" r="${this.dotSize}"></circle>`
            );
          }
          x += this.letterSpacing;
        }
      }
      return svgElements.join("");
    },
    updateSvgSize(input) {
      let maxWidth = 0;
      let currentWidth = 0;
      let currentHeight = 0;
      for (let char of input) {
        if (char === "\n") {
          maxWidth = Math.max(maxWidth, currentWidth);
          currentWidth = 0;
          currentHeight += this.lineSpacing;
        } else if (char === " ") {
          currentWidth += this.letterSpacing;
        } else {
          currentWidth += this.letterSpacing;
        }
      }
      maxWidth = Math.max(maxWidth, currentWidth);
      currentHeight += this.lineSpacing;
      this.svgWidth = maxWidth + (this.svgPadding*2) - (this.dotSpacing + this.dotSize/2);
      this.svgHeight = currentHeight + (this.svgPadding*2) - (this.lineSpacing - ( (this.dotSpacing*2) + (this.dotSize*2) ));
    },
    downloadSvg() {
      const scaledWidth = this.svgWidth * (this.scale / 2); // Use scale variable
      const scaledHeight = this.svgHeight * (this.scale / 2); // Use scale variable
      const blob = new Blob(
        [`<svg xmlns="http://www.w3.org/2000/svg" width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${this.svgWidth} ${this.svgHeight}">${this.svgContent}</svg>`],
        { type: "image/svg+xml" }
      );
      const element = document.createElement("a");
      element.download = this.textInput.replace(/\s/g, "") + "-braille-" + this.svgWidth + "x" + this.svgHeight + ".svg"; // Update filename
      element.href = window.URL.createObjectURL(blob);
      element.click();
      element.remove();
    },
    downloadPdf(){
      // PDF document setup
      var x = 0;
      var y = 0;
      var width = this.svgWidth;
      var height = this.svgHeight;
      var canvasWidth = this.svgWidth+0;
      var canvasHeight = this.svgHeight+0;
      var orientation = canvasWidth > canvasHeight ? 'l' : 'p';

      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [canvasWidth, canvasHeight],
        putOnlyUsedFonts:true,
        compress: true})

      const element = document.getElementById('svgBraille')
      doc.svg(element, {
            x,
            y,
            width,
            height
      })
      .then(() => {
        doc.save(this.textInput.replace(/\s/g, "") + '-braille-' + this.svgWidth + 'x' + this.svgHeight + '.pdf');
      })
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.brailleOutput).then(() => {
        this.tooltipText = 'Copied!';
        setTimeout(() => {
          this.tooltipText = 'Click to copy';
        }, 2000);
      });
    },
    eraseTextarea() {
      this.textInput = '';
      this.generateBrailleText();
    },
  },
};
</script>

<style scoped>
.build-num {
  font-size: 0.7em;
  position: absolute;
  right: 1em;
  bottom: 1em;
}
</style>






