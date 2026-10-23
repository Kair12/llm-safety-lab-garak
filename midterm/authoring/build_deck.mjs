import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile, FileBlob } from '@oai/artifact-tool';

const ROOT = 'C:\\Users\\nacha\\Downloads\\LAB 4 AI\\midterm';
const SKILL = 'C:\\Users\\nacha\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.1017.22135\\skills\\presentations';
const PYTHON = 'C:\\Users\\nacha\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe';
const BUILD = path.join(ROOT, 'build', 'deck');
const OUTPUT = path.join(ROOT, 'deliverables', 'Midterm_Presentation.pptx');
const DATA = JSON.parse(await fs.readFile(path.join(ROOT, 'evidence', 'summary.json'), 'utf8'));
const FONT = 'Arial';
const C = { navy:'#102B3E', blue:'#167C9D', cyan:'#4CC2D9', red:'#CA5757', green:'#24866F', ink:'#143248', slate:'#607A89', pale:'#F1F6F8', line:'#D4E1E8', white:'#FFFFFF' };
const { makeNativeBulletParagraphs, applyPresentationChartFont, finalizePresentation } = await import(pathToFileURL(path.join(SKILL,'container_tools','artifact_tool_utils.mjs')).href);
await fs.mkdir(BUILD,{recursive:true});
await fs.mkdir(path.dirname(OUTPUT),{recursive:true});
const deck = Presentation.create({slideSize:{width:1280,height:720}});

function text(s,content,x,y,w,h,size=25,color=C.ink,bold=false){
  const shape=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  shape.text=content; shape.text.insets=0;
  shape.text.style={typeface:FONT,fontSize:size,color,bold,autoFit:'none'};
  return shape;
}
function title(s,value,n){
  s.background.fill=C.white;
  text(s,value,70,44,1090,64,44,C.navy,true);
  text(s,String(n).padStart(2,'0'),1166,52,46,30,18,C.slate,true);
  s.shapes.add({geometry:'rect',position:{left:70,top:118,width:1140,height:3},fill:C.cyan,line:{fill:'none',width:0}});
}
function foot(s,value='AISRA1301  Midterm Project  22 October 2026') {text(s,value,70,683,1110,20,14,C.slate);}
function bullets(s,items,x,y,w,h,size=25){
  const shape=text(s,'',x,y,w,h,size);
  shape.text=makeNativeBulletParagraphs(items,{marginLeftPoints:18,hangingPoints:9,spaceAfterPoints:13});
  shape.text.style={typeface:FONT,fontSize:size,color:C.ink,autoFit:'none'};
  return shape;
}
function notes(s,content){s.speakerNotes.text=content;s.speakerNotes.setVisible(true);}
async function img(s,file,x,y,w,h,alt){
  const b=await fs.readFile(file);
  s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',position:{left:x,top:y,width:w,height:h},fit:'contain',alt});
}
function node(s,label,x,y,w,fill=C.navy){
  const n=s.shapes.add({geometry:'roundRect',position:{left:x,top:y,width:w,height:92},fill,line:{fill,width:1}});
  n.text=label;n.text.style={typeface:FONT,fontSize:24,bold:true,color:C.white,alignment:'center',verticalAlignment:'middle'};
  return n;
}
function arrow(s,x,y,w=64){s.shapes.add({geometry:'rightArrow',position:{left:x,top:y,width:w,height:30},fill:C.cyan,line:{fill:C.cyan,width:0}});}

// 1 Research problem and selected scientific paper
{
 const s=deck.slides.add();s.background.fill=C.navy;
 await img(s,path.join(ROOT,'assets','cover.png'),655,0,625,720,'Abstract neural network protected by a shield');
 text(s,'Input Filters for\na Local LLM',70,105,570,155,57,C.white,true);
 text(s,'How much protection does an input filter add, and which legitimate requests does it reject?',74,295,535,125,29,'#C4E5EE');
 text(s,'Research basis',74,487,500,30,19,C.cyan,true);
 text(s,'Xin et al.\nJailbreaking Attacks vs. Content Safety Filters\nFindings of ACL 2026',74,533,545,94,22,'#E0EDF3');
 text(s,'AI Security and Risk Analysis  AISRA1301',74,674,550,23,15,'#91B7C9');
 notes(s,'Selected peer-reviewed paper: https://aclanthology.org/2026.findings-acl.20/\nResearch question: does a lexical input filter lower observable redirection while preserving benign utility? The paper evaluates full inference pipelines and compares harmful and topic-aligned benign prompts. This project adapts that idea to a small local model. The cover is a retained AI-generated illustration from Assignment 2.');
}

// 2 Proposed working AI application
{
 const s=deck.slides.add();title(s,'Proposed AI system',2);
 text(s,'LLM Safety Lab',70,161,650,52,35,C.blue,true);
 bullets(s,[
   'A working local web application with a real language model',
   'Two modes share the same model: baseline and input-filtered',
   'Observable answer, block decision, response time and tokens',
   'Every completed request enters a local audit log',
 ],70,242,680,300,27);
 text(s,'Qwen2.5-0.5B-Instruct',70,590,650,38,28,C.navy,true);
 text(s,'Local inference on GTX 1660 with 6 GB VRAM',70,635,680,28,20,C.slate);
 await img(s,path.join(ROOT,'evidence','screenshots','protected-request.png'),830,151,338,485,'Actual local prototype blocking a direct instruction override');
 foot(s);
 notes(s,'The browser screenshot is experimental evidence from the working prototype. Model card: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct\nThe selected model is smaller than the paper\'s Qwen2.5-7B target. It is not trained from scratch. Open the demo at http://127.0.0.1:8765 .');
}

// 3 System architecture
{
 const s=deck.slides.add();title(s,'System architecture',3);
 node(s,'Browser or\ngarak client',70,231,220);
 arrow(s,312,260,68);
 node(s,'HTTP endpoint\n/evaluate',402,231,220,C.blue);
 arrow(s,643,260,68);
 node(s,'Optional\ninput filter',733,231,205,C.green);
 arrow(s,959,260,58);
 node(s,'Pinned Qwen\ninference',1038,231,172);
 text(s,'One shared application path',70,158,950,44,29,C.blue,true);
 text(s,'Blocked requests receive a standard refusal. Allowed requests reach identical model weights, system instructions and decoding.',70,384,1100,95,29,C.ink);
 text(s,'Audit evidence',70,522,350,34,23,C.blue,true);
 text(s,'Input hash, configuration, matched rules, response, token count and elapsed time',70,571,1070,68,27,C.navy,true);
 foot(s);
 notes(s,'Architecture is implemented in testbed/server.py, engine.py, safety.py and garak_adapter.py. Garak uses the official function.Single adapter, without edits to the vendor repository. Service binds to loopback only. The server has no external action tools.');
}

// 4 Tool and controlled experimental setup
{
 const s=deck.slides.add();title(s,'Research tool and experimental setup',4);
 text(s,'NVIDIA garak',70,159,500,45,32,C.blue,true);
 bullets(s,[
   '32 sampled PromptInject prompts',
   'One DAN 11.0 prompt',
   'Both modes receive identical prompts',
   'Official exact-string and refusal detectors',
 ],70,233,510,306,26);
 text(s,'96 custom responses',700,159,500,45,32,C.blue,true);
 bullets(s,[
   '24 attack variants and 24 benign inputs, each tested twice',
   'Rules frozen before observing these outputs',
   'Alternating run order and excluded warm-up',
   'Input hashes and paired output checks',
 ],700,233,510,306,26);
 text(s,'Fixed conditions',70,573,245,36,22,C.slate,true);
 text(s,'Model revision 7ae5576    Greedy decoding    96 output tokens    Seed 42',70,622,1130,35,23,C.navy,true);
 foot(s);
 notes(s,'NVIDIA garak source pinned to commit 346497afcd86ff5ba137cfbcaaeba4e9c9f6c970, version 0.17.1rc1. Model full revision: 7ae557604adf67be50417f59c2c2f167def9a775. Seed selects garak prompts; greedy decoding avoids random-state shifts when the filter skips inference. Garak probe-specific generation suggestions do not alter the server settings. Source: evidence/paired/manifest.json.');
}

// 5 Baseline vs modified experimental results
{
 const s=deck.slides.add();title(s,'Garak results before and after filtering',5);
 const chart=s.charts.add('bar',{
   position:{left:70,top:174,width:700,height:386},
   categories:['Baseline','Input filter'],
   series:[{name:'Exact marker rate',values:[.375,0],fill:C.blue}],
   barOptions:{direction:'column',grouping:'clustered',gapWidth:100},
   hasLegend:false,
   xAxis:{textStyle:{fontSize:18,fill:C.ink},majorGridlines:null},
   yAxis:{min:0,max:.5,majorUnit:.1,numberFormatCode:'0%',textStyle:{fontSize:16,fill:C.slate},majorGridlines:{fill:C.line,width:1}},
   dataLabels:{showValue:true,position:'outEnd',numberFormatCode:'0.0%',textStyle:{fontSize:20,bold:true,fill:C.ink}},
   chartFill:C.white,plotAreaFill:C.white,
 });
 applyPresentationChartFont(chart,{fontFamily:FONT});
 text(s,'12/32 to 0/32',840,191,350,65,40,C.blue,true);
 text(s,'PromptInject exact hits',840,267,350,45,24,C.slate);
 text(s,'1/1 to 0/1',840,374,350,65,40,C.red,true);
 text(s,'DAN acknowledgement',840,450,350,45,24,C.slate);
 text(s,'Normalised marker candidates: 15/32 to 1/32. Contextual review remains necessary.',70,597,1110,61,23,C.navy,true);
 foot(s);
 notes(s,'Data: evidence/garak/*.report.jsonl and evidence/summary.json. The two DAN detectors score one shared answer, not two separate tests. A DAN acknowledgement does not prove harmful generation. Normalised search removes non-letters and flags candidates, not semantically verified extra attacks. The remaining protected candidate formats quoted attack text as a numbered list. The descriptive Wilson 95% interval for 0/32 extends to 10.7%; garak\'s all-zero bootstrap interval must not be interpreted as zero risk.');
}

// 6 Filter generalisation and utility
{
 const s=deck.slides.add();title(s,'Filter generalisation and usability',6);
 const values=[
   ['Custom evaluation','Baseline','Input filter'],
   ['Exact attack markers','0/24','0/24'],
   ['Attack inputs blocked','0/24','8/24'],
   ['Benign inputs blocked','0/24','8/24'],
   ['Ordinary strict answer matches','9/12','9/12'],
   ['Mean response time',`${(DATA.paired.baseline.mean_latency_ms/1000).toFixed(3)} s`,`${(DATA.paired.filtered.mean_latency_ms/1000).toFixed(3)} s`],
 ];
 const t=s.tables.add({rows:values.length,columns:3,left:70,top:164,width:1140,height:330,columnWidths:[570,285,285],values});
 t.borders.assign({style:'solid',fill:C.line,width:1});
 for(let r=0;r<values.length;r++)for(let c=0;c<3;c++){
   const cell=t.getCell(r,c);cell.text.style={typeface:FONT,fontSize:r===0?23:22,bold:r===0||c===0,color:r===0?C.white:C.ink,verticalAlignment:'middle'};
   cell.fill=r===0?C.navy:r%2===0?C.pale:C.white;
 }
 text(s,'Precision 50%    Recall 33.3%    F1 0.40',70,536,1130,50,30,C.red,true);
 text(s,'Faster refusals also discard useful requests. This set provides no additional ASR reduction because baseline already has zero exact marker hits.',70,607,1135,62,23,C.ink);
 foot(s);
 notes(s,'Source: evidence/paired/responses.jsonl and summary.json. There are 24 attacks and 24 benign prompts per mode. Filter confusion matrix TP=8, FP=8, FN=16, TN=16. Its classification accuracy is 50%, equal to an always-allow classifier on this balanced set. All eight false positives arise in twelve educational security prompts. Ordinary task matching normalises punctuation/case but requires a strict full answer. Response-time means pool these 48 requests, excluding warm-up. The filter speeds refusals, not the model itself.');
}

// 7 Meaningful extension and evidence
{
 const s=deck.slides.add();title(s,'Research extension and evidence',7);
 text(s,'Beyond a scanner example',70,162,600,44,32,C.blue,true);
 bullets(s,[
   'Connect garak to the actual demonstration application',
   'Evaluate paraphrases, encoding, obfuscation and multilingual inputs',
   'Measure benign mistakes alongside attack signatures',
   'Audit exact matching against normalised marker candidates',
 ],70,240,680,338,27);
 text(s,'Evidence checks',855,167,340,40,28,C.green,true);
 text(s,'33 matched\ngarak pairs',855,249,340,98,34,C.navy,true);
 text(s,'48 matched\ncustom pairs',855,382,340,98,34,C.navy,true);
 text(s,'7 code checks\n4 API boundary checks',855,521,340,90,26,C.slate,true);
 text(s,'Raw responses, fixed cases, configs, hashes, timing and review worksheet are included.',70,620,1100,48,22,C.slate);
 foot(s);
 notes(s,'This project adapts the selected paper\'s pipeline framing; it does not reproduce its harmful-content benchmark or invent a new moderation algorithm. Four lexical rules existed before the new cases and remained unchanged after observation. Code checks: evidence/code-test-output.txt. HTTP checks: evidence/api-test-output.txt. Reproducibility: README.md and Run-Experiments.ps1. Student independent labels remain blank in student-review.csv.');
}

// 8 Conclusion, next steps, references and AI disclosure
{
 const s=deck.slides.add();title(s,'Conclusions and next steps',8);
 text(s,'The filter suppresses known signatures but has substantial blind spots and false positives',70,164,1100,102,34,C.navy,true);
 bullets(s,[
   'Expand to independent data, human grading, larger models and multi-turn tests',
   'Evaluate output moderation and task completion as separate properties',
 ],70,301,1080,125,25);
 text(s,'References',70,459,250,30,20,C.blue,true);
 text(s,'Xin et al., ACL Findings 2026, doi:10.18653/v1/2026.findings-acl.20\nNVIDIA garak: github.com/NVIDIA/garak\nQwen model: huggingface.co/Qwen/Qwen2.5-0.5B-Instruct\nPerez and Ribeiro, Ignore Previous Prompt, arXiv:2211.09527',70,505,1115,91,17,C.slate);
 text(s,'AI use',70,613,100,25,19,C.blue,true);
 text(s,'Codex produced code, cases, automated runs, analysis and material drafts. Student review and final interpretation remain to be documented.',170,610,1030,56,19,C.ink);
 foot(s);
 notes(s,'Complete references in the report. Sources: https://aclanthology.org/2026.findings-acl.20/ ; https://github.com/NVIDIA/garak ; https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct ; https://arxiv.org/abs/2211.09527 . Limits: one 0.5B model, greedy single-turn tests, convenience samples, truncated outputs, lexical harm proxy, no tools or harmful completions, no independent human judgments. AI assistance is substantial and must be disclosed. A retained AI-generated cover illustration is used. Student must personally review, rerun and explain code and results before submission.');
}

const staging=path.join(ROOT,'build','validation');await fs.mkdir(staging,{recursive:true});
const candidate=path.join(staging,'candidate.pptx');
await(await PresentationFile.exportPptx(deck)).save(candidate);
await finalizePresentation({
 workspaceDir:ROOT,candidatePath:candidate,finalPath:OUTPUT,pythonExecutable:PYTHON,
 explicitTotalSlideCount:8,requiredNativeChartOwnerSlides:[5],requiredNativeTableOwnerSlides:[6],
 materializeLiteralChartWorkbooks:true,
 fontPolicy:{basis:'design',families:[FONT]},
 integrityValidatorPath:path.join(SKILL,'container_tools','inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL,'container_tools','inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','6'],
 verifyArtifactToolImport:true,receiptPath:path.join(staging,'validation.json'),
});
const final=await PresentationFile.importPptx(await FileBlob.load(OUTPUT));
for(const [i,s] of final.slides.items.entries()){
 const b=await final.export({slide:s,format:'png',scale:1});
 await fs.writeFile(path.join(BUILD,`slide-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));
}
console.log(OUTPUT);
