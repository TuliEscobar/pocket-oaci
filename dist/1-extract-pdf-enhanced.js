"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var pdf_lib_1 = require("pdf-lib");
// Require CommonJS modules
var pdfParse = require('pdf-parse');
var GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
// Initialise Gemini AI (ensure GOOGLE_API_KEY env var is set)
var genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
/** Detect if a PDF is likely an aeronautical chart */
function isAeronauticalChart(filename, text) {
    var chartKeywords = ['carta', 'chart', 'enr', 'aip', 'sup', 'inf', 'navigation'];
    var nameMatch = chartKeywords.some(function (k) { return filename.toLowerCase().includes(k); });
    // Heuristic: many single-character lines indicate spatial layout
    var spacedLines = (text.match(/\n[A-Z]\n/g) || []).length;
    var ratio = spacedLines / Math.max(text.length, 1);
    return nameMatch || ratio > 0.001;
}
/** Placeholder image extraction – real rendering would need additional libs */
function extractImagesFromPDF(pdfPath) {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, pdfDoc, pages, images, i, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    buffer = fs_1.default.readFileSync(pdfPath);
                    return [4 /*yield*/, pdf_lib_1.PDFDocument.load(buffer)];
                case 1:
                    pdfDoc = _a.sent();
                    pages = pdfDoc.getPages();
                    images = [];
                    // For demonstration we just note the page numbers; imageData left empty
                    for (i = 0; i < Math.min(pages.length, 5); i++) {
                        console.log("   \uD83D\uDCC4 Page ".concat(i + 1, " marked for image extraction (placeholder)"));
                        images.push({ pageNumber: i + 1, imageData: '' });
                    }
                    return [2 /*return*/, images];
                case 2:
                    e_1 = _a.sent();
                    console.error('   ⚠️ Error extracting images:', e_1.message);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/** Analyse a chart image with Gemini Vision (placeholder – uses empty base64) */
function analyzeChartWithVision(imageBase64, pageNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var model, prompt_1, result, response, description, structuredData, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
                    prompt_1 = "Analiza esta carta aeron\u00E1utica y extrae la siguiente informaci\u00F3n estructurada:\n\n1. Aerov\u00EDas (Airways)\n2. Waypoints con coordenadas\n3. Frecuencias de radio\n4. Espacios a\u00E9reos (FIR, TMA, CTR, CTA)\n5. Restricciones (SAP, SAR, SAD)\n6. Radioayudas (VOR, NDB, DME)\n\nProporciona una respuesta clara para planificaci\u00F3n de ruta.";
                    return [4 /*yield*/, model.generateContent([
                            { text: prompt_1 },
                            { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                        ])];
                case 1:
                    result = _a.sent();
                    return [4 /*yield*/, result.response];
                case 2:
                    response = _a.sent();
                    description = response.text();
                    structuredData = extractStructuredData(description);
                    return [2 /*return*/, { pageNumber: pageNumber, description: description, structuredData: structuredData }];
                case 3:
                    e_2 = _a.sent();
                    console.error('   ⚠️ Gemini Vision error:', e_2.message);
                    return [2 /*return*/, { pageNumber: pageNumber, description: 'Error analysing image' }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/** Simple regex‑based extraction of structured data from Gemini description */
function extractStructuredData(text) {
    var data = { airways: [], waypoints: [], frequencies: [], airspaces: [], restrictions: [] };
    var airwayMatches = text.match(/[AWZNBGR]\d{1,3}/g);
    if (airwayMatches)
        data.airways = __spreadArray([], new Set(airwayMatches), true);
    var freqMatches = text.match(/\d{3}\.\d{2,3}/g);
    if (freqMatches)
        data.frequencies = __spreadArray([], new Set(freqMatches), true);
    var airspaceMatches = text.match(/(FIR|TMA|CTR|CTA)\s+[A-Z]+/g);
    if (airspaceMatches)
        data.airspaces = __spreadArray([], new Set(airspaceMatches), true);
    var restrictionMatches = text.match(/SA[RPD]\s+\d+/g);
    if (restrictionMatches)
        data.restrictions = __spreadArray([], new Set(restrictionMatches), true);
    var wpMatches = text.match(/[A-Z]{5}\s+[\d°′″NSEW]+/g);
    if (wpMatches)
        data.waypoints = __spreadArray([], new Set(wpMatches), true);
    return data;
}
/** Clean extracted PDF text – special handling for charts */
function cleanExtractedText(text, isChart) {
    if (!isChart) {
        return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    var lines = text.split('\n').filter(function (l) { return l.trim().length > 10; });
    var preview = lines.slice(0, 50).join('\n');
    return "[CARTA AERON\u00C1UTICA - Contenido principalmente visual]\n\n".concat(preview);
}
/** Fallback textual description for a chart based on raw text */
function generateChartDescription(text) {
    var airways = __spreadArray([], new Set(text.match(/[AWZNBGR]\d{1,3}/g) || []), true);
    var frequencies = __spreadArray([], new Set(text.match(/\d{3}\.\d{2,3}/g) || []), true);
    var firs = __spreadArray([], new Set(text.match(/FIR\s+[A-Z]+/g) || []), true);
    var tmas = __spreadArray([], new Set(text.match(/TMA\s+[A-Z]+/g) || []), true);
    var desc = '**Carta de Navegación – Información Extraída:**\n\n';
    if (firs.length)
        desc += "**FIRs:** ".concat(firs.join(', '), "\n\n");
    if (tmas.length)
        desc += "**TMAs:** ".concat(tmas.join(', '), "\n\n");
    if (airways.length)
        desc += "**Aerov\u00EDas:** ".concat(airways.slice(0, 20).join(', ')).concat(airways.length > 20 ? '...' : '', "\n\n");
    if (frequencies.length)
        desc += "**Frecuencias:** ".concat(frequencies.slice(0, 15).join(', ')).concat(frequencies.length > 15 ? '...' : '', "\n\n");
    return desc;
}
/** Extract structured data directly from raw PDF text (fallback) */
function extractStructuredDataFromText(text) {
    return {
        airways: __spreadArray([], new Set(text.match(/[AWZNBGR]\d{1,3}/g) || []), true),
        waypoints: __spreadArray([], new Set(text.match(/[A-Z]{5}\s+[\d°′″NSEW]+/g) || []), true).slice(0, 50),
        frequencies: __spreadArray([], new Set(text.match(/\d{3}\.\d{2,3}/g) || []), true),
        airspaces: __spreadArray([], new Set(text.match(/(FIR|TMA|CTR|CTA)\s+[A-Z]+/g) || []), true),
        restrictions: __spreadArray([], new Set(text.match(/SA[RPD]\s+\d+/g) || []), true),
    };
}
function extractDocNumber(filename) {
    var m = filename.match(/(\d+)/);
    return m ? m[1] : 'unknown';
}
/** Main PDF processing function */
function processAllPDFs() {
    return __awaiter(this, void 0, void 0, function () {
        var rawDir, processedDir, files, chartsProcessed, docsProcessed, _i, files_1, file, pdfPath, dataBuffer, data, filename, isChart, metadata, images, cleanedText, output, outPath, sd, e_3;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    rawDir = path_1.default.join(process.cwd(), 'data', 'raw');
                    processedDir = path_1.default.join(process.cwd(), 'data', 'processed');
                    if (!fs_1.default.existsSync(processedDir))
                        fs_1.default.mkdirSync(processedDir, { recursive: true });
                    files = fs_1.default.readdirSync(rawDir).filter(function (f) { return f.toLowerCase().endsWith('.pdf'); });
                    if (files.length === 0) {
                        console.log('⚠️ No PDFs found in data/raw/');
                        console.log('📝 Place your OACI PDFs in that folder and retry.');
                        return [2 /*return*/];
                    }
                    console.log("\uD83D\uDCC4 Found ".concat(files.length, " PDFs to process...\n"));
                    chartsProcessed = 0;
                    docsProcessed = 0;
                    _i = 0, files_1 = files;
                    _d.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 6];
                    file = files_1[_i];
                    console.log("\uD83D\uDD04 Processing: ".concat(file));
                    pdfPath = path_1.default.join(rawDir, file);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    dataBuffer = fs_1.default.readFileSync(pdfPath);
                    return [4 /*yield*/, pdfParse(dataBuffer)];
                case 3:
                    data = _d.sent();
                    filename = path_1.default.basename(pdfPath);
                    isChart = isAeronauticalChart(filename, data.text);
                    metadata = {
                        filename: filename,
                        title: ((_a = data.info) === null || _a === void 0 ? void 0 : _a.Title) || filename,
                        type: isChart ? 'chart' : (filename.toLowerCase().includes('anexo') ? 'annex' : 'doc'),
                        number: extractDocNumber(filename),
                        extractedAt: new Date().toISOString(),
                        hasImages: isChart,
                        imageCount: 0,
                    };
                    images = void 0;
                    if (isChart) {
                        console.log('   🗺️ Detected aeronautical chart – placeholder image analysis');
                        images = [{
                                pageNumber: 1,
                                description: generateChartDescription(data.text),
                                structuredData: extractStructuredDataFromText(data.text),
                            }];
                        metadata.imageCount = images.length;
                        chartsProcessed++;
                    }
                    else {
                        docsProcessed++;
                    }
                    cleanedText = cleanExtractedText(data.text, isChart);
                    output = {
                        metadata: metadata,
                        text: cleanedText,
                        images: images,
                        pageCount: cleanedText.split('\n\n').length,
                        characterCount: cleanedText.length,
                    };
                    outPath = path_1.default.join(processedDir, "".concat(path_1.default.parse(file).name, ".json"));
                    fs_1.default.writeFileSync(outPath, JSON.stringify(output, null, 2));
                    console.log("   \u2705 Extracted ".concat(cleanedText.length.toLocaleString(), " characters"));
                    console.log("   \uD83D\uDCCA Type: ".concat(metadata.type.toUpperCase()));
                    if (images && images.length) {
                        console.log("   \uD83D\uDDBC\uFE0F Images analysed: ".concat(images.length));
                        sd = images[0].structuredData;
                        if (sd)
                            console.log("   \u2708\uFE0F Airways: ".concat(((_b = sd.airways) === null || _b === void 0 ? void 0 : _b.length) || 0, ", Frequencies: ").concat(((_c = sd.frequencies) === null || _c === void 0 ? void 0 : _c.length) || 0));
                    }
                    console.log("   \uD83D\uDCBE Saved to ".concat(path_1.default.basename(outPath), "\n"));
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _d.sent();
                    console.error("   \u274C Error processing ".concat(file, ":"), e_3.message);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log('✨ Extraction complete!\n');
                    console.log('📊 Summary:');
                    console.log("   - Cartas aeron\u00E1uticas: ".concat(chartsProcessed));
                    console.log("   - Documentos de texto: ".concat(docsProcessed));
                    console.log("   - Total: ".concat(chartsProcessed + docsProcessed));
                    console.log('\n📁 Processed files are in data/processed/');
                    return [2 /*return*/];
            }
        });
    });
}
processAllPDFs().catch(console.error);
