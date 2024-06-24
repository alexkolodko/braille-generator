<template>
<section class="section">
<div class="container">
    <div class="block">
      <h1 class="is-size-3 has-text-weight-bold">Брайль <sup>β</sup></h1>
    </div>
    <div class="block">
      <label for="iptText">Текст:</label>
      <textarea class="textarea is-medium" id="iptText" v-model="textInput" @input="generateBrailleText" placeholder="Введіть текст…"></textarea>
    </div>
    <div class="block">
      <label for="iptBraille">Текст Брайлем (Unicode):</label>
      <textarea class="textarea is-medium" id="iptBraille" v-model="brailleOutput" @click="copyToClipboard" :title="tooltipText" readonly placeholder="Введіть текст…"></textarea>
      <!-- <button class="button is-small">Шрифт</button> -->
      <!-- <div
        id="iptBraille"
        class="braille-output"
        v-text="brailleOutput"
        @click="copyToClipboard"
        :title="tooltipText"
      ></div> -->
    </div>
    <div class="block" > <!-- v-if="textInput.trim() && svgWidth > 0" -->
      <div class="block">
        <p v-if="textInput.length > 0">У векторі. Фізичний розмір: <b>{{ this.svgWidth }}×{{ this.svgHeight }} мм</b></p>
      </div>
      <div class="block">
        <svg
        id="svgBraille"
        :innerHTML="svgContent"
        :width="(textInput.length > 20 || isMobile) ? '100%' : svgWidth * scale"
        :height="svgHeight * (isMobile ? '100%' : scale)"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        ></svg>
      </div>
      <div class="buttons">
        <button class="button is-warning" @click="downloadSvg" :disabled="!textInput.trim()">Завантажити SVG</button>
        <button class="button is-warning" @click="downloadPdf" :disabled="!textInput.trim()">Завантажити PDF</button>
      </div>
    </div>
  </div>
</section>
</template>

<script>
// SVG 2 PDF converter
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

export default {
  data() {
    return {
      textInput: "",
      brailleOutput: "",
      svgContent: "",
      svgWidth: 0, // Initial width
      svgHeight: 0, // Initial height
      svgPadding: 0,
      svgXStart: 0,
      svgYStart: 0,
      scale: 10,
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
        "⠃": "12",
        "⠉": "14",
        "⠙": "145",
        "⠑": "15",
        "⠋": "124",
        "⠛": "1245",
        "⠓": "125",
        "⠊": "24",
        "⠚": "245",
        "⠅": "13",
        "⠇": "123",
        "⠍": "134",
        "⠝": "1345",
        "⠕": "135",
        "⠏": "1234",
        "⠟": "12345",
        "⠗": "1235",
        "⠎": "234",
        "⠞": "2345",
        "⠥": "136",
        "⠧": "1236",
        "⠺": "2456",
        "⠭": "1346",
        "⠽": "13456",
        "⠵": "1356",
        "⠼": "3456",
        "⠂": "2",
        "⠒": "25",
        "⠲": "256",
        "⠦": "236",
        "⠖": "235",
        "⠐⠣": "5 126",
        "⠐⠜": "5 345",
        "⠸⠌": "456 34",
        "⠸⠡": "456 16",
        "⠤": "36",
      },
      textToBraille: {
        " ": " ",
        "\n": "\n",
        "a": "",
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
        ",": "⠂",
        ":": "⠒",
        ".": "⠲",
        "?": "⠦",
        "!": "⠖",
        "(": "⠐⠣",
        ")": "⠐⠜",
        "/": "⠸⠌",
        "": "⠸⠡",
        "-": "⠤",
        // Ukrainian characters
        "а": "⠁",
        "б": "⠃",
        "в": "⠉",
        "г": "⠛",
        "ґ": "⠛",
        "д": "⠙",
        "е": "⠑",
        "є": "⠑",
        "ж": "⠚",
        "з": "⠵",
        "и": "⠊",
        "і": "⠊",
        "ї": "⠚",
        "й": "⠚",
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
        "щ": "⠱",
        "ь": "⠹",
        "ю": "⠽",
        "я": "⠷",
      },
      dotStyles: [
        "fill: black;",
        "fill: none; stroke: black; stroke-width: 0.15;",
        "fill: #333;",
        "fill: #666;"
      ],
      selectedDotStyleIndex: 0, // Index of the currently selected dot style
      tooltipText: 'Клацніть, щоб скопіювати',
    };
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
  methods: {
    generateBrailleText() {
      let input = this.textInput.toLowerCase();
      let result = "";
      let isPreviousCharDigit = false;

      for (let char of input) {
        if (/\d/.test(char)) {
          if (!isPreviousCharDigit) {
            result += "⠼"; // Add Braille number sign before the first digit in a group
          }
          isPreviousCharDigit = true;
        } else {
          isPreviousCharDigit = false;
        }

        if (char === "\n") {
          result += "\n"; // Preserve newline characters
        } else if (Object.prototype.hasOwnProperty.call(this.textToBraille, char)) {
          result += this.textToBraille[char];
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
      this.svgWidth = maxWidth + (this.svgPadding) - (this.dotSpacing + this.dotSize/2);
      this.svgHeight = currentHeight + (this.svgPadding*2) - (this.lineSpacing - ( (this.dotSpacing*2) + (this.dotSize*2) ));
    },
    downloadSvg() {
      const blob = new Blob(
        [`<svg xmlns="http://www.w3.org/2000/svg" width="${this.svgWidth}" height="${this.svgHeight}">${this.svgContent}</svg>`],
        { type: "image/svg+xml" }
      );
      const element = document.createElement("a");
      element.download = this.textInput.replace(/\s/g, "") + "-braille.svg";
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
  },
};
</script>

<style scoped>

</style>




