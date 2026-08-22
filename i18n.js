'use strict';

(() => {
  const SUPPORTED_LANGUAGES = ['ja', 'en', 'zh-CN', 'ko'];
  const PDF_LANGUAGE_VALUES = ['same', ...SUPPORTED_LANGUAGES];

  const I18N = {
    ja: {
      ui: {
        brandTagline:'Visual license PDF builder', language:'表示言語', autosave:'自動保存', autosaveHelp:'ONにすると、このブラウザに入力内容を保存します', saved:'保存済み',
        introEyebrow:'SIMPLE BY DESIGN', introTitle:'見れば分かる、<br>作品のルール。', introDescription:'長い説明は減らして、<b>許可・要相談・禁止</b>を一目で伝えるPDFにします。',
        modeCustom:'カスタム', workCardTitle:'作品', workCardSubtitle:'PDF上部に表示します', title:'タイトル', creator:'作者', workName:'作品名', workType:'種類', updatedAt:'更新日', contact:'連絡先・配布ページ（任意）', contactPlaceholder:'URL / X / メールなど。空欄ならPDFに表示しません',
        customCardTitle:'使い方', customCardSubtitle:'7項目を 許可 / 要相談 / 禁止 から選びます', preset:'プリセット', credit:'クレジット', required:'必須', recommended:'推奨', notRequired:'不要', creditExample:'表記例', restrictionsSummary:'細かい禁止事項・補足', notes:'補足',
        ccSubtitle:'公式ライセンスを選択', license:'ライセンス', ccNotesSummary:'補足・メモ', ccNotesLabel:'PDFのNOTEに追記する文章（任意）', ccNotesPlaceholder:'ここに入力した内容は、CCライセンスの固定案内文の次の行から表示されます', ccNotesHelp:'Creative Commonsの条件に従う固定案内文は残り、その下にこの内容を追記します。',
        softwareTitle:'OSSライセンス', softwareSubtitle:'代表的なものから選択', softwareScope:'適用範囲（任意）', softwareScopePlaceholder:'例: ソースコードに適用', softwareNotesSummary:'補足・メモ', softwareNotesLabel:'PDFのNOTEに表示する文章（任意）', softwareNotesPlaceholder:'空欄なら選択したライセンスの概要を自動表示します', softwareNotesHelp:'説明や利用上の補足を書く欄です。標準OSSライセンスそのものの条件は変更しません。',
        designTitle:'デザイン', designSubtitle:'PDFの雰囲気だけ選びます', theme:'テーマ', illustration:'右上のイラスト（任意）', imageNone:'画像なし', imageSet:'画像を設定済み', imageAdjusted:'調整済み画像', imageRemove:'画像を外す', imageReedit:'位置を再調整',
        pdfLanguage:'PDFの言語', pdfLanguageSame:'設定言語と同じ', download:'PDFを書き出す', downloadSub:'A4・1ページ', livePreview:'LIVE PREVIEW', onePage:'A4 / 1 page',
        imageEditorTitle:'画像を調整', imageEditorDescription:'ドラッグして位置を調整し、PDFに表示する範囲を決めます。', imageEditorClose:'閉じる', imageEditorHint:'画像をドラッグして位置を調整', imageEditorZoom:'ズーム', imageEditorReset:'位置とズームをリセット', imageEditorCancel:'キャンセル', imageEditorApply:'この範囲で決定',
        statusCreatingPdf:'PDFを作成しています…', statusExportedPdf:'PDFを書き出しました。', statusPdfFailed:'PDFの作成に失敗しました。', statusImageReadFailed:'画像を読み込めませんでした。', statusPreparingCc:'Creative Commonsバッジを準備しています…', statusImageEditorFailed:'画像編集を開始できませんでした。', statusImageSaveFailed:'画像の調整を保存できませんでした。',
        deniedPrefix:'禁止'
      },
      workType:{illustration:'イラスト・画像',model:'3Dモデル',music:'音楽・音声',video:'動画・映像',game:'ゲーム・ゲーム素材',character:'キャラクター・立ち絵',document:'文章・資料',font:'フォント・デザイン素材',other:'その他'},
      preset:{creator:'クリエイター向け標準',open:'自由に使ってOK',marketplace:'素材販売向け',strict:'許可制・厳格'},
      policy:{commercial:'商用利用',monetized:'収益化コンテンツ',modification:'改変・加工',project:'作品への組み込み',merchandise:'グッズ・商品化',redistribution:'素材の再配布',ai:'AI学習・生成AI利用'},
      restriction:{adult:'成人向け',political:'政治・宗教',ai:'AI学習・生成AI',nft:'NFT',harmful:'違法・中傷',impersonation:'公式を装う利用'},
      status:{allow:'許可',ask:'要相談',conditions:'条件',deny:'禁止'},
      term:{shareRedistribute:'共有・再配布',adapt:'改変・翻案',shareAlike:'改変物は同じ条件で共有',shareAdaptations:'改変物の共有',modify:'改変',redistribute:'再配布',privateUse:'私的利用',patentUse:'特許利用',keepCopyrightLicense:'著作権表示とライセンス文を保持',keepLicenseText:'ライセンス文の保持',stateChanges:'変更点の明示',keepCopyrightConditions:'著作権表示と条件文を保持',noEndorsement:'作者名による推薦を装う利用',discloseChangedFiles:'変更した対象ファイルのソース公開',discloseSource:'派生作品のソース公開',sameLicense:'同一条件の継承'},
      softwareNote:{MIT:'短く自由度の高いOSSライセンスです。','Apache-2.0':'特許条項を含む寛容型ライセンスです。','BSD-3-Clause':'シンプルな寛容型ライセンスです。','MPL-2.0':'ファイル単位の弱いコピーレフトです。','GPL-3.0':'強いコピーレフトのライセンスです。'},
      pdf:{kicker:'ライセンス / 利用規約',defaultTitle:'作品利用ガイド',thisWork:'この作品',description:'「{work}」を使うときのルールを、ひと目で確認できるようにまとめています。',metaCreator:'作者',metaWork:'作品',metaType:'種類',metaUpdated:'更新',none:'該当なし',ccLicenseKicker:'CREATIVE COMMONS ライセンス',ccOfficial:'Creative Commons 公式ライセンス',softwareLicenseKicker:'オープンソースライセンス',softwareScope:'適用範囲',softwareStandard:'標準オープンソースライセンス',creditKicker:'クレジット / 帰属表示',creditRequired:'クレジット表記が必要です',creditRecommended:'クレジット表記を推奨します',creditNotRequired:'クレジット表記は不要です',licenseNotice:'ライセンス表記',softwareCredit:'ライセンス本文・著作権表示など、選択したOSSライセンスの条件に従ってください。',examplePrefix:'例',optionalExamplePrefix:'任意で表記する場合の例',creatorPlaceholder:'作者名',workPlaceholder:'作品名',statusRequired:'REQUIRED',statusRecommended:'RECOMMENDED',statusNotRequired:'NOT REQUIRED',statusLicenseNotice:'LICENSE NOTICE',note:'NOTE',contact:'CONTACT',footerCreated:'License Creator で作成',customFallbackNote:'必要に応じて作者へお問い合わせください。',ccFollowTerms:'Creative Commons {license} の条件に従って利用してください。'}
    },
    en: {
      ui: {
        brandTagline:'Visual license PDF builder', language:'Language', autosave:'Autosave', autosaveHelp:'When enabled, your inputs are saved in this browser', saved:'Saved',
        introEyebrow:'SIMPLE BY DESIGN', introTitle:'Clear rules,<br>at a glance.', introDescription:'Turn long explanations into a one-page PDF showing what is <b>allowed, conditional, or not allowed</b>.',
        modeCustom:'Custom', workCardTitle:'Work', workCardSubtitle:'Shown at the top of the PDF', title:'Title', creator:'Creator', workName:'Work title', workType:'Type', updatedAt:'Updated date', contact:'Contact / distribution page (optional)', contactPlaceholder:'URL / social account / email. Leave blank to omit from the PDF',
        customCardTitle:'Usage rules', customCardSubtitle:'Choose Allowed / Ask first / Not allowed for 7 items', preset:'Preset', credit:'Credit / attribution', required:'Required', recommended:'Recommended', notRequired:'Not required', creditExample:'Example attribution', restrictionsSummary:'Additional restrictions / notes', notes:'Notes',
        ccSubtitle:'Choose an official license', license:'License', ccNotesSummary:'Additional notes', ccNotesLabel:'Text to append to the PDF NOTE (optional)', ccNotesPlaceholder:'This text appears on the line after the fixed Creative Commons guidance', ccNotesHelp:'The fixed Creative Commons guidance remains unchanged; this text is added below it.',
        softwareTitle:'Open-source license', softwareSubtitle:'Choose from common licenses', softwareScope:'Scope (optional)', softwareScopePlaceholder:'Example: Applies to source code', softwareNotesSummary:'Additional notes', softwareNotesLabel:'Text to show in the PDF NOTE (optional)', softwareNotesPlaceholder:'Leave blank to show the selected license summary automatically', softwareNotesHelp:'Use this for explanations or usage notes. It does not change the terms of the standard open-source license.',
        designTitle:'Design', designSubtitle:'Choose the visual style of the PDF', theme:'Theme', illustration:'Top-right illustration (optional)', imageNone:'No image', imageSet:'Image set', imageAdjusted:'Adjusted image', imageRemove:'Remove image', imageReedit:'Adjust position again',
        pdfLanguage:'PDF language', pdfLanguageSame:'Same as app language', download:'Export PDF', downloadSub:'A4 · 1 page', livePreview:'LIVE PREVIEW', onePage:'A4 / 1 page',
        imageEditorTitle:'Adjust image', imageEditorDescription:'Drag to reposition the image and choose the area shown in the PDF.', imageEditorClose:'Close', imageEditorHint:'Drag the image to reposition it', imageEditorZoom:'Zoom', imageEditorReset:'Reset position and zoom', imageEditorCancel:'Cancel', imageEditorApply:'Use this crop',
        statusCreatingPdf:'Creating PDF…', statusExportedPdf:'PDF exported.', statusPdfFailed:'Could not create the PDF.', statusImageReadFailed:'Could not read the image.', statusPreparingCc:'Preparing the Creative Commons badge…', statusImageEditorFailed:'Could not open the image editor.', statusImageSaveFailed:'Could not save the image adjustment.',
        deniedPrefix:'Not allowed'
      },
      workType:{illustration:'Illustration / image',model:'3D model',music:'Music / audio',video:'Video / film',game:'Game / game asset',character:'Character / sprite',document:'Text / document',font:'Font / design asset',other:'Other'},
      preset:{creator:'Standard for creators',open:'Free to use',marketplace:'For asset sales',strict:'Permission-based / strict'},
      policy:{commercial:'Commercial use',monetized:'Monetized content',modification:'Modification',project:'Use in a project',merchandise:'Merchandise / products',redistribution:'Redistribution of the asset',ai:'AI training / generative AI use'},
      restriction:{adult:'Adult content',political:'Political / religious use',ai:'AI training / generative AI',nft:'NFT',harmful:'Illegal / abusive use',impersonation:'Pretending to be official'},
      status:{allow:'Allowed',ask:'Ask first',conditions:'Conditions',deny:'Not allowed'},
      term:{shareRedistribute:'Share / redistribute',adapt:'Adapt / modify',shareAlike:'Share adaptations under the same terms',shareAdaptations:'Sharing adaptations',modify:'Modification',redistribute:'Redistribution',privateUse:'Private use',patentUse:'Patent use',keepCopyrightLicense:'Keep copyright and license notices',keepLicenseText:'Keep the license text',stateChanges:'State changes made',keepCopyrightConditions:'Keep copyright notice and conditions',noEndorsement:'Use of author names to imply endorsement',discloseChangedFiles:'Disclose source for modified files',discloseSource:'Disclose source for derivative works',sameLicense:'Keep the same license terms'},
      softwareNote:{MIT:'A short, permissive open-source license.','Apache-2.0':'A permissive license that includes an explicit patent grant.','BSD-3-Clause':'A simple permissive open-source license.','MPL-2.0':'A weak copyleft license applied on a file-by-file basis.','GPL-3.0':'A strong copyleft open-source license.'},
      pdf:{kicker:'LICENSE / TERMS OF USE',defaultTitle:'Usage Guide',thisWork:'this work',description:'A quick guide to the rules for using “{work}”.',metaCreator:'Creator',metaWork:'Work',metaType:'Type',metaUpdated:'Updated',none:'None',ccLicenseKicker:'CREATIVE COMMONS LICENSE',ccOfficial:'Official Creative Commons license',softwareLicenseKicker:'OPEN-SOURCE LICENSE',softwareScope:'Scope',softwareStandard:'Standard open-source license',creditKicker:'CREDIT / ATTRIBUTION',creditRequired:'Credit attribution is required',creditRecommended:'Credit attribution is recommended',creditNotRequired:'Credit attribution is not required',licenseNotice:'License notice',softwareCredit:'Follow the selected open-source license, including its license text and copyright notice requirements.',examplePrefix:'Example',optionalExamplePrefix:'Optional attribution example',creatorPlaceholder:'Creator',workPlaceholder:'Work title',statusRequired:'REQUIRED',statusRecommended:'RECOMMENDED',statusNotRequired:'NOT REQUIRED',statusLicenseNotice:'LICENSE NOTICE',note:'NOTE',contact:'CONTACT',footerCreated:'Created with License Creator',customFallbackNote:'Contact the creator if you need clarification.',ccFollowTerms:'Use this work in accordance with the terms of Creative Commons {license}.'}
    },
    'zh-CN': {
      ui: {
        brandTagline:'可视化许可证 PDF 生成器', language:'界面语言', autosave:'自动保存', autosaveHelp:'开启后，输入内容会保存在此浏览器中', saved:'已保存',
        introEyebrow:'简洁设计', introTitle:'一眼看懂，<br>作品使用规则。', introDescription:'减少冗长说明，用一页 PDF 清楚展示<b>允许、条件与禁止</b>。',
        modeCustom:'自定义', workCardTitle:'作品', workCardSubtitle:'显示在 PDF 顶部', title:'标题', creator:'作者', workName:'作品名称', workType:'类型', updatedAt:'更新日期', contact:'联系方式 / 发布页面（可选）', contactPlaceholder:'URL / 社交账号 / 邮箱。留空则不显示在 PDF 中',
        customCardTitle:'使用规则', customCardSubtitle:'为 7 个项目选择 允许 / 需先咨询 / 禁止', preset:'预设', credit:'署名', required:'必须', recommended:'建议', notRequired:'不需要', creditExample:'署名示例', restrictionsSummary:'其他限制 / 补充', notes:'补充说明',
        ccSubtitle:'选择官方许可证', license:'许可证', ccNotesSummary:'补充说明', ccNotesLabel:'追加到 PDF“备注”的文字（可选）', ccNotesPlaceholder:'此处内容会显示在 Creative Commons 固定提示语的下一行', ccNotesHelp:'Creative Commons 的固定提示语会保留，此处内容仅追加在其下方。',
        softwareTitle:'开源许可证', softwareSubtitle:'从常用许可证中选择', softwareScope:'适用范围（可选）', softwareScopePlaceholder:'例如：适用于源代码', softwareNotesSummary:'补充说明', softwareNotesLabel:'显示在 PDF“备注”中的文字（可选）', softwareNotesPlaceholder:'留空则自动显示所选许可证的概要', softwareNotesHelp:'用于填写说明或使用补充，不会改变标准开源许可证本身的条款。',
        designTitle:'设计', designSubtitle:'选择 PDF 的视觉风格', theme:'主题', illustration:'右上角插图（可选）', imageNone:'无图片', imageSet:'已设置图片', imageAdjusted:'已调整图片', imageRemove:'移除图片', imageReedit:'重新调整位置',
        pdfLanguage:'PDF 语言', pdfLanguageSame:'与界面语言相同', download:'导出 PDF', downloadSub:'A4 · 1 页', livePreview:'实时预览', onePage:'A4 / 1 页',
        imageEditorTitle:'调整图片', imageEditorDescription:'拖动图片调整位置，并决定 PDF 中显示的范围。', imageEditorClose:'关闭', imageEditorHint:'拖动图片调整位置', imageEditorZoom:'缩放', imageEditorReset:'重置位置与缩放', imageEditorCancel:'取消', imageEditorApply:'使用此范围',
        statusCreatingPdf:'正在生成 PDF…', statusExportedPdf:'PDF 已导出。', statusPdfFailed:'PDF 生成失败。', statusImageReadFailed:'无法读取图片。', statusPreparingCc:'正在准备 Creative Commons 标识…', statusImageEditorFailed:'无法打开图片编辑器。', statusImageSaveFailed:'无法保存图片调整。',
        deniedPrefix:'禁止'
      },
      workType:{illustration:'插图 / 图片',model:'3D 模型',music:'音乐 / 音频',video:'视频 / 影像',game:'游戏 / 游戏素材',character:'角色 / 立绘',document:'文章 / 文档',font:'字体 / 设计素材',other:'其他'},
      preset:{creator:'创作者标准',open:'自由使用',marketplace:'素材销售用',strict:'许可制 / 严格'},
      policy:{commercial:'商业使用',monetized:'盈利内容',modification:'修改 / 加工',project:'用于作品 / 项目',merchandise:'周边 / 商品化',redistribution:'素材再分发',ai:'AI 训练 / 生成式 AI 使用'},
      restriction:{adult:'成人内容',political:'政治 / 宗教用途',ai:'AI 训练 / 生成式 AI',nft:'NFT',harmful:'违法 / 诽谤用途',impersonation:'冒充官方'},
      status:{allow:'允许',ask:'需先咨询',conditions:'条件',deny:'禁止'},
      term:{shareRedistribute:'共享 / 再发布',adapt:'修改 / 改编',shareAlike:'改编作品须以相同条款共享',shareAdaptations:'分享改编作品',modify:'修改',redistribute:'再发布',privateUse:'私人使用',patentUse:'专利使用',keepCopyrightLicense:'保留版权声明与许可证文本',keepLicenseText:'保留许可证文本',stateChanges:'注明修改内容',keepCopyrightConditions:'保留版权声明与条件文本',noEndorsement:'使用作者名称暗示推荐或背书',discloseChangedFiles:'公开已修改文件的源代码',discloseSource:'公开衍生作品的源代码',sameLicense:'沿用相同许可证条款'},
      softwareNote:{MIT:'简短、宽松的开源许可证。','Apache-2.0':'包含明确专利授权条款的宽松许可证。','BSD-3-Clause':'简洁的宽松型开源许可证。','MPL-2.0':'以文件为单位适用的弱 Copyleft 许可证。','GPL-3.0':'强 Copyleft 开源许可证。'},
      pdf:{kicker:'许可证 / 使用条款',defaultTitle:'作品使用指南',thisWork:'本作品',description:'汇总了使用“{work}”时需要遵守的规则，方便快速查看。',metaCreator:'作者',metaWork:'作品',metaType:'类型',metaUpdated:'更新',none:'无',ccLicenseKicker:'CREATIVE COMMONS 许可证',ccOfficial:'Creative Commons 官方许可证',softwareLicenseKicker:'开源许可证',softwareScope:'适用范围',softwareStandard:'标准开源许可证',creditKicker:'署名 / 归属',creditRequired:'需要署名',creditRecommended:'建议署名',creditNotRequired:'无需署名',licenseNotice:'许可证声明',softwareCredit:'请遵守所选开源许可证的条件，包括许可证文本与版权声明等要求。',examplePrefix:'示例',optionalExamplePrefix:'可选署名示例',creatorPlaceholder:'作者',workPlaceholder:'作品名称',statusRequired:'必须',statusRecommended:'建议',statusNotRequired:'不需要',statusLicenseNotice:'许可证声明',note:'备注',contact:'联系方式',footerCreated:'由 License Creator 生成',customFallbackNote:'如有疑问，请联系作者。',ccFollowTerms:'请按照 Creative Commons {license} 的条款使用。'}
    },
    ko: {
      ui: {
        brandTagline:'시각형 라이선스 PDF 빌더', language:'화면 언어', autosave:'자동 저장', autosaveHelp:'켜면 입력 내용을 이 브라우저에 저장합니다', saved:'저장됨',
        introEyebrow:'간결한 설계', introTitle:'한눈에 보는<br>작품 이용 규칙.', introDescription:'긴 설명을 줄이고 <b>허용·조건·금지</b>를 한 페이지 PDF로 명확하게 보여줍니다.',
        modeCustom:'사용자 지정', workCardTitle:'작품', workCardSubtitle:'PDF 상단에 표시됩니다', title:'제목', creator:'제작자', workName:'작품명', workType:'종류', updatedAt:'업데이트 날짜', contact:'연락처 / 배포 페이지(선택)', contactPlaceholder:'URL / SNS / 이메일. 비워 두면 PDF에 표시하지 않습니다',
        customCardTitle:'이용 규칙', customCardSubtitle:'7개 항목을 허용 / 사전 문의 / 금지 중에서 선택합니다', preset:'프리셋', credit:'크레딧 / 저작자 표시', required:'필수', recommended:'권장', notRequired:'불필요', creditExample:'표기 예시', restrictionsSummary:'추가 금지 사항 / 보충', notes:'보충 설명',
        ccSubtitle:'공식 라이선스 선택', license:'라이선스', ccNotesSummary:'보충 메모', ccNotesLabel:'PDF NOTE에 추가할 문장(선택)', ccNotesPlaceholder:'입력한 내용은 Creative Commons 고정 안내문 다음 줄부터 표시됩니다', ccNotesHelp:'Creative Commons 고정 안내문은 그대로 유지되고, 이 내용은 그 아래에 추가됩니다.',
        softwareTitle:'오픈소스 라이선스', softwareSubtitle:'대표 라이선스에서 선택', softwareScope:'적용 범위(선택)', softwareScopePlaceholder:'예: 소스 코드에 적용', softwareNotesSummary:'보충 메모', softwareNotesLabel:'PDF NOTE에 표시할 문장(선택)', softwareNotesPlaceholder:'비워 두면 선택한 라이선스의 설명을 자동 표시합니다', softwareNotesHelp:'설명이나 이용 관련 보충을 적는 칸입니다. 표준 오픈소스 라이선스 자체의 조건은 변경하지 않습니다.',
        designTitle:'디자인', designSubtitle:'PDF의 분위기를 선택합니다', theme:'테마', illustration:'오른쪽 위 일러스트(선택)', imageNone:'이미지 없음', imageSet:'이미지 설정됨', imageAdjusted:'조정된 이미지', imageRemove:'이미지 제거', imageReedit:'위치 다시 조정',
        pdfLanguage:'PDF 언어', pdfLanguageSame:'화면 언어와 동일', download:'PDF 내보내기', downloadSub:'A4 · 1페이지', livePreview:'실시간 미리보기', onePage:'A4 / 1페이지',
        imageEditorTitle:'이미지 조정', imageEditorDescription:'드래그하여 위치를 조정하고 PDF에 표시할 범위를 정합니다.', imageEditorClose:'닫기', imageEditorHint:'이미지를 드래그해 위치 조정', imageEditorZoom:'확대/축소', imageEditorReset:'위치와 확대/축소 초기화', imageEditorCancel:'취소', imageEditorApply:'이 범위로 결정',
        statusCreatingPdf:'PDF를 만드는 중…', statusExportedPdf:'PDF를 내보냈습니다.', statusPdfFailed:'PDF 생성에 실패했습니다.', statusImageReadFailed:'이미지를 읽을 수 없습니다.', statusPreparingCc:'Creative Commons 배지를 준비하는 중…', statusImageEditorFailed:'이미지 편집기를 열 수 없습니다.', statusImageSaveFailed:'이미지 조정을 저장할 수 없습니다.',
        deniedPrefix:'금지'
      },
      workType:{illustration:'일러스트 / 이미지',model:'3D 모델',music:'음악 / 음성',video:'영상',game:'게임 / 게임 소재',character:'캐릭터 / 스탠딩 이미지',document:'문서 / 자료',font:'폰트 / 디자인 소재',other:'기타'},
      preset:{creator:'크리에이터 표준',open:'자유롭게 사용',marketplace:'소재 판매용',strict:'허가제 / 엄격'},
      policy:{commercial:'상업적 이용',monetized:'수익화 콘텐츠',modification:'수정 / 가공',project:'작품에 포함',merchandise:'굿즈 / 상품화',redistribution:'소재 재배포',ai:'AI 학습 / 생성형 AI 이용'},
      restriction:{adult:'성인용',political:'정치 / 종교 용도',ai:'AI 학습 / 생성형 AI',nft:'NFT',harmful:'불법 / 비방 용도',impersonation:'공식 사칭'},
      status:{allow:'허용',ask:'사전 문의',conditions:'조건',deny:'금지'},
      term:{shareRedistribute:'공유 / 재배포',adapt:'변경 / 각색',shareAlike:'변경물은 동일 조건으로 공유',shareAdaptations:'변경물 공유',modify:'수정',redistribute:'재배포',privateUse:'개인 이용',patentUse:'특허 이용',keepCopyrightLicense:'저작권 표시와 라이선스 문구 유지',keepLicenseText:'라이선스 문구 유지',stateChanges:'변경 사항 명시',keepCopyrightConditions:'저작권 표시와 조건문 유지',noEndorsement:'제작자 이름으로 추천·보증을 가장하는 이용',discloseChangedFiles:'수정한 파일의 소스 공개',discloseSource:'파생 저작물의 소스 공개',sameLicense:'동일 라이선스 조건 유지'},
      softwareNote:{MIT:'짧고 자유도가 높은 오픈소스 라이선스입니다.','Apache-2.0':'명시적인 특허 조항을 포함한 허용적 라이선스입니다.','BSD-3-Clause':'간단한 허용적 오픈소스 라이선스입니다.','MPL-2.0':'파일 단위로 적용되는 약한 카피레프트 라이선스입니다.','GPL-3.0':'강한 카피레프트 오픈소스 라이선스입니다.'},
      pdf:{kicker:'라이선스 / 이용 약관',defaultTitle:'작품 이용 가이드',thisWork:'이 작품',description:'“{work}” 사용 시 필요한 규칙을 한눈에 확인할 수 있도록 정리했습니다.',metaCreator:'제작자',metaWork:'작품',metaType:'종류',metaUpdated:'업데이트',none:'해당 없음',ccLicenseKicker:'CREATIVE COMMONS 라이선스',ccOfficial:'Creative Commons 공식 라이선스',softwareLicenseKicker:'오픈소스 라이선스',softwareScope:'적용 범위',softwareStandard:'표준 오픈소스 라이선스',creditKicker:'크레딧 / 저작자 표시',creditRequired:'크레딧 표기가 필요합니다',creditRecommended:'크레딧 표기를 권장합니다',creditNotRequired:'크레딧 표기가 필요하지 않습니다',licenseNotice:'라이선스 고지',softwareCredit:'라이선스 문구와 저작권 표시 등 선택한 오픈소스 라이선스의 조건을 따라 주세요.',examplePrefix:'예',optionalExamplePrefix:'선택적으로 표기할 경우의 예',creatorPlaceholder:'제작자명',workPlaceholder:'작품명',statusRequired:'필수',statusRecommended:'권장',statusNotRequired:'불필요',statusLicenseNotice:'라이선스 고지',note:'메모',contact:'연락처',footerCreated:'License Creator로 제작',customFallbackNote:'필요한 경우 제작자에게 문의해 주세요.',ccFollowTerms:'Creative Commons {license} 조건에 따라 이용해 주세요.'}
    }
  };

  const TERM_KEY_BY_JA = {
    '共有・再配布':'term.shareRedistribute',
    '改変・翻案':'term.adapt',
    '商用利用':'policy.commercial',
    '改変物は同じ条件で共有':'term.shareAlike',
    '改変物の共有':'term.shareAdaptations',
    '改変':'term.modify',
    '再配布':'term.redistribute',
    '私的利用':'term.privateUse',
    '特許利用':'term.patentUse',
    '著作権表示とライセンス文を保持':'term.keepCopyrightLicense',
    'ライセンス文の保持':'term.keepLicenseText',
    '変更点の明示':'term.stateChanges',
    '著作権表示と条件文を保持':'term.keepCopyrightConditions',
    '作者名による推薦を装う利用':'term.noEndorsement',
    '変更した対象ファイルのソース公開':'term.discloseChangedFiles',
    '派生作品のソース公開':'term.discloseSource',
    '同一条件の継承':'term.sameLicense'
  };

  const STATUS_MESSAGE_KEYS = {
    'PDFを作成しています…':'ui.statusCreatingPdf',
    'PDFを書き出しました。':'ui.statusExportedPdf',
    'PDFの作成に失敗しました。':'ui.statusPdfFailed',
    '画像を読み込めませんでした。':'ui.statusImageReadFailed',
    'Creative Commonsバッジを準備しています…':'ui.statusPreparingCc',
    '画像編集を開始できませんでした。':'ui.statusImageEditorFailed',
    '画像の調整を保存できませんでした。':'ui.statusImageSaveFailed'
  };

  function languageOrFallback(value){
    return SUPPORTED_LANGUAGES.includes(value) ? value : 'ja';
  }

  function readPath(object,path){
    return String(path).split('.').reduce((value,key)=>value && value[key],object);
  }

  function interpolate(value,vars={}){
    return String(value ?? '').replace(/\{([a-zA-Z0-9_]+)\}/g,(_,key)=>String(vars[key] ?? `{${key}}`));
  }

  function translate(path,lang='ja',vars={}){
    const resolved=languageOrFallback(lang);
    let value=readPath(I18N[resolved],path);
    if(value == null) value=readPath(I18N.ja,path);
    if(value == null){
      console.warn(`[i18n] Missing translation: ${resolved}:${path}`);
      return path;
    }
    return interpolate(value,vars);
  }

  function uiLanguage(){
    return languageOrFallback(state?.uiLanguage);
  }

  function resolvedPdfLanguage(){
    const selected=state?.pdfLanguage;
    return selected==='same' ? uiLanguage() : languageOrFallback(selected);
  }

  function t(path,vars={}){ return translate(path,uiLanguage(),vars); }
  function pdfT(path,vars={}){ return translate(path,resolvedPdfLanguage(),vars); }

  function systemTerm(value,lang){
    const key=TERM_KEY_BY_JA[String(value || '')];
    return key ? translate(key,lang) : String(value || '');
  }

  function migrateLanguageState(){
    if(!SUPPORTED_LANGUAGES.includes(state.uiLanguage)) state.uiLanguage='ja';
    if(!PDF_LANGUAGE_VALUES.includes(state.pdfLanguage)) state.pdfLanguage='same';
    if(typeof state.titleCustomized!=='boolean'){
      const current=String(state.title || '').trim();
      state.titleCustomized=Boolean(current && current!=='作品利用ガイド');
    }
  }

  migrateLanguageState();

  window.LICENSE_I18N=I18N;
  window.licenseT=t;
  window.licensePdfT=pdfT;
  window.licenseResolvedPdfLanguage=resolvedPdfLanguage;

  // Use a CJK-capable local font stack without shipping or persisting font files.
  weight=function(w,size){
    return `${w} ${size}px Inter,"Noto Sans CJK JP","Noto Sans CJK SC","Noto Sans CJK KR","Noto Sans JP","Microsoft YaHei","PingFang SC","Malgun Gothic","Apple SD Gothic Neo","Yu Gothic",Meiryo,sans-serif`;
  };

  // Match the PDF line breaker to the selected export language rather than a
  // hard-coded Japanese segmenter.
  textSegments=function(text){
    const value=String(text ?? '');
    try{
      if(typeof Intl!=='undefined' && Intl.Segmenter){
        return Array.from(new Intl.Segmenter(resolvedPdfLanguage(),{granularity:'word'}).segment(value),s=>s.segment);
      }
    }catch(err){ /* fall through */ }
    return Array.from(value);
  };

  function setNodeText(node,value){ if(node) node.textContent=value; }
  function setNodeHtml(node,value){ if(node) node.innerHTML=value; }
  function setFieldLabel(id,value){
    const node=document.querySelector(`#${id}`);
    const label=node?.closest('.field');
    const span=label?.querySelector(':scope > span');
    setNodeText(span,value);
  }
  function setCheckboxLabel(id,value){
    const input=document.querySelector(`#${id}`);
    const label=input?.closest('label');
    if(!label) return;
    let textNode=Array.from(label.childNodes).find(node=>node.nodeType===Node.TEXT_NODE);
    if(!textNode){ textNode=document.createTextNode(''); label.appendChild(textNode); }
    textNode.nodeValue=value;
  }
  function setCardHeader(card,title,subtitle){
    setNodeText(card?.querySelector('.card-head strong'),title);
    setNodeText(card?.querySelector('.card-head small'),subtitle);
  }
  function systemImageLabel(value){
    const raw=String(value || '');
    if(['画像なし','No image','无图片','이미지 없음'].includes(raw)) return t('ui.imageNone');
    if(['画像を設定済み','Image set','已设置图片','이미지 설정됨'].includes(raw)) return t('ui.imageSet');
    if(['調整済み画像','Adjusted image','已调整图片','조정된 이미지'].includes(raw)) return t('ui.imageAdjusted');
    return raw;
  }

  function syncSelectOptionText(){
    if(el.workType){
      Array.from(el.workType.options).forEach(option=>{
        if(I18N.ja.workType[option.value]) option.textContent=t(`workType.${option.value}`);
      });
    }
    if(el.preset){
      Array.from(el.preset.options).forEach(option=>{
        if(I18N.ja.preset[option.value]) option.textContent=t(`preset.${option.value}`);
      });
    }

    document.querySelectorAll('#policyMatrix [data-policy]').forEach(row=>{
      const key=row.dataset.policy;
      const name=row.querySelector('.policy-name');
      if(name && readPath(I18N.ja,`policy.${key}`)){
        const icon=name.querySelector('.policy-icon');
        Array.from(name.childNodes).forEach(node=>{ if(node!==icon) node.remove(); });
        name.appendChild(document.createTextNode(t(`policy.${key}`)));
      }
      row.querySelectorAll('button[data-value]').forEach(button=>{
        const key=button.dataset.value==='allow'?'allow':button.dataset.value==='ask'?'ask':'deny';
        button.textContent=t(`status.${key}`);
      });
    });

    const credit=document.querySelector('[data-segment="credit"]');
    setNodeText(credit?.querySelector('[data-value="required"]'),t('ui.required'));
    setNodeText(credit?.querySelector('[data-value="recommended"]'),t('ui.recommended'));
    setNodeText(credit?.querySelector('[data-value="none"]'),t('ui.notRequired'));

    const uiSelect=document.querySelector('#uiLanguageSelect');
    if(uiSelect) uiSelect.value=state.uiLanguage;
    const pdfSelect=document.querySelector('#pdfLanguageSelect');
    if(pdfSelect){
      pdfSelect.value=state.pdfLanguage;
      const same=pdfSelect.querySelector('option[value="same"]');
      setNodeText(same,t('ui.pdfLanguageSame'));
    }
  }

  function localizeImageEditor(){
    setNodeText(document.querySelector('#imageEditorTitle'),t('ui.imageEditorTitle'));
    setNodeText(document.querySelector('.image-editor-head p'),t('ui.imageEditorDescription'));
    const close=document.querySelector('#imageEditorClose');
    if(close) close.setAttribute('aria-label',t('ui.imageEditorClose'));
    setNodeText(document.querySelector('.image-editor-hint span:last-child'),t('ui.imageEditorHint'));
    setNodeText(document.querySelector('.image-editor-control-head strong'),t('ui.imageEditorZoom'));
    setNodeText(document.querySelector('#imageEditorReset'),t('ui.imageEditorReset'));
    setNodeText(document.querySelector('#imageEditorCancel'),t('ui.imageEditorCancel'));
    setNodeText(document.querySelector('#imageEditorApply'),t('ui.imageEditorApply'));
    setNodeText(document.querySelector('#reeditImageButton'),t('ui.imageReedit'));
  }

  function localizeGeneratedEditors(){
    const ccCredit=document.querySelector('#ccCreditExampleBlock');
    setNodeText(ccCredit?.querySelector('.mini-title'),t('ui.credit'));
    setNodeText(ccCredit?.querySelector('.field > span'),t('ui.creditExample'));

    const ccNotes=document.querySelector('#ccNotesDetails');
    setNodeText(ccNotes?.querySelector('summary'),t('ui.ccNotesSummary'));
    setNodeText(ccNotes?.querySelector('.field > span'),t('ui.ccNotesLabel'));
    const ccNotesInput=document.querySelector('#ccNotesInput');
    if(ccNotesInput) ccNotesInput.placeholder=t('ui.ccNotesPlaceholder');
    setNodeText(ccNotes?.querySelector('.details-body > small'),t('ui.ccNotesHelp'));

    const swNotes=document.querySelector('#softwareNotesDetails');
    setNodeText(swNotes?.querySelector('summary'),t('ui.softwareNotesSummary'));
    setNodeText(swNotes?.querySelector('.field > span'),t('ui.softwareNotesLabel'));
    const swNotesInput=document.querySelector('#softwareNotesInput');
    if(swNotesInput) swNotesInput.placeholder=t('ui.softwareNotesPlaceholder');
    setNodeText(swNotes?.querySelector('.details-body > small'),t('ui.softwareNotesHelp'));

    const imageLabel=document.querySelector('#imageLabel');
    if(imageLabel) imageLabel.textContent=systemImageLabel(imageLabel.textContent);
    localizeImageEditor();
  }

  function applyUiLanguage(){
    const lang=uiLanguage();
    document.documentElement.lang=lang;

    setNodeText(document.querySelector('.brand small'),t('ui.brandTagline'));
    setNodeText(document.querySelector('#uiLanguageLabel'),t('ui.language'));
    const autosave=document.querySelector('.autosave-control');
    if(autosave) autosave.title=t('ui.autosaveHelp');
    setNodeText(autosave?.querySelector('.autosave-copy strong'),t('ui.autosave'));

    setNodeText(document.querySelector('.intro .eyebrow'),t('ui.introEyebrow'));
    setNodeHtml(document.querySelector('.intro h1'),t('ui.introTitle'));
    setNodeHtml(document.querySelector('.intro p:not(.eyebrow)'),t('ui.introDescription'));

    setNodeText(document.querySelector('.mode-tab[data-mode="custom"]'),t('ui.modeCustom'));

    const workCard=document.querySelector('#titleInput')?.closest('.card');
    setCardHeader(workCard,t('ui.workCardTitle'),t('ui.workCardSubtitle'));
    setFieldLabel('titleInput',t('ui.title'));
    setFieldLabel('creatorInput',t('ui.creator'));
    setFieldLabel('workNameInput',t('ui.workName'));
    setFieldLabel('workTypeSelect',t('ui.workType'));
    setFieldLabel('updatedAtInput',t('ui.updatedAt'));
    setFieldLabel('contactInput',t('ui.contact'));
    if(el.contact) el.contact.placeholder=t('ui.contactPlaceholder');

    const custom=document.querySelector('#customSection');
    setCardHeader(custom,t('ui.customCardTitle'),t('ui.customCardSubtitle'));
    setFieldLabel('presetSelect',t('ui.preset'));
    const customCredit=document.querySelector('#creditTextInput')?.closest('.mini-block');
    setNodeText(customCredit?.querySelector('.mini-title'),t('ui.credit'));
    setFieldLabel('creditTextInput',t('ui.creditExample'));
    const customDetails=custom?.querySelector('details');
    setNodeText(customDetails?.querySelector('summary'),t('ui.restrictionsSummary'));
    setCheckboxLabel('restrictionAdult',t('restriction.adult'));
    setCheckboxLabel('restrictionPolitical',t('restriction.political'));
    setCheckboxLabel('restrictionAi',t('restriction.ai'));
    setCheckboxLabel('restrictionNft',t('restriction.nft'));
    setCheckboxLabel('restrictionHarmful',t('restriction.harmful'));
    setCheckboxLabel('restrictionImpersonation',t('restriction.impersonation'));
    setFieldLabel('notesInput',t('ui.notes'));

    const cc=document.querySelector('#ccSection');
    setCardHeader(cc,'Creative Commons',t('ui.ccSubtitle'));
    setFieldLabel('ccLicenseSelect',t('ui.license'));

    const software=document.querySelector('#softwareSection');
    setCardHeader(software,t('ui.softwareTitle'),t('ui.softwareSubtitle'));
    setFieldLabel('softwareLicenseSelect',t('ui.license'));
    setFieldLabel('softwareScopeInput',t('ui.softwareScope'));
    if(el.softwareScope) el.softwareScope.placeholder=t('ui.softwareScopePlaceholder');

    const design=document.querySelector('#themeSelect')?.closest('.card');
    setCardHeader(design,t('ui.designTitle'),t('ui.designSubtitle'));
    setFieldLabel('themeSelect',t('ui.theme'));
    setFieldLabel('imageInput',t('ui.illustration'));
    setNodeText(document.querySelector('#resetImageButton'),t('ui.imageRemove'));
    setNodeText(document.querySelector('#pdfLanguageLabel'),t('ui.pdfLanguage'));
    setNodeText(document.querySelector('#downloadPdfButton strong'),t('ui.download'));
    setNodeText(document.querySelector('#downloadPdfButton small'),t('ui.downloadSub'));

    setNodeText(document.querySelector('.preview-head .eyebrow'),t('ui.livePreview'));
    setNodeText(document.querySelector('.preview-head strong'),t('ui.onePage'));

    if(!state.titleCustomized && el.title) el.title.value=t('pdf.defaultTitle');
    syncSelectOptionText();
    localizeGeneratedEditors();
    if(typeof syncCcCreditExampleEditor==='function') syncCcCreditExampleEditor();
  }

  // Replace the final result-card renderer so CC/OSS descriptions follow the
  // editor language while official license names, SPDX identifiers and URLs stay unchanged.
  renderResults=function(){
    const cc=DATA.cc[state.ccLicense];
    if(cc && el.ccResult){
      const badge=typeof ccBadgeInfo==='function' ? (ccBadgeInfo()?.official || '') : '';
      const allow=cc.allow.map(value=>systemTerm(value,uiLanguage()));
      const deny=cc.deny.map(value=>systemTerm(value,uiLanguage()));
      el.ccResult.innerHTML=`
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          ${badge ? `<img src="${badge}" width="88" height="31" alt="${state.ccLicense} Creative Commons license button" style="display:block;width:88px;height:31px;object-fit:contain;">` : ''}
          <div style="min-width:0;">
            <strong>${state.ccLicense}</strong>
            <p style="margin:.3rem 0 0;">${allow.join(' / ')}${deny.length ? `　${t('ui.deniedPrefix')}: ${deny.join(' / ')}` : ''}</p>
          </div>
        </div>
        <a href="${cc.url}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:.6rem;font-size:.8rem;overflow-wrap:anywhere;">${cc.url}</a>
      `;
    }

    const sw=DATA.software[state.softwareLicense];
    if(sw && el.softwareResult){
      const meta=typeof ossMeta==='function' ? ossMeta() : {name:state.softwareLicense,spdx:state.softwareLicense};
      el.softwareResult.innerHTML=`
        <strong>${meta.name}</strong>
        <p>${translate(`softwareNote.${state.softwareLicense}`,uiLanguage())}</p>
        <small style="display:block;margin-top:.45rem;color:#667085;">SPDX: ${meta.spdx}</small>
      `;
    }

    if(typeof syncCcCreditExampleEditor==='function') syncCcCreditExampleEditor();
    localizeGeneratedEditors();
  };

  // Keep the CC attribution placeholder localized. The value itself is always user data.
  ccCreditExamplePlaceholder=function(){
    const prefix=isCcZero() ? t('pdf.optionalExamplePrefix') : t('pdf.examplePrefix');
    const quoteStart=uiLanguage()==='ja' ? '「' : '“';
    const quoteEnd=uiLanguage()==='ja' ? '」' : '”';
    return `${prefix}: ${quoteStart}${t('pdf.workPlaceholder')}${quoteEnd} by ${t('pdf.creatorPlaceholder')} / ${state.ccLicense || 'CC BY 4.0'} / URL`;
  };

  const baseSetStatusI18n=setStatus;
  setStatus=function(text,error=false){
    const key=STATUS_MESSAGE_KEYS[String(text || '')];
    return baseSetStatusI18n(key ? t(key) : text,error);
  };

  // Autosave is still opt-in; only its short-lived UI status is localized.
  saveState=function(){
    if(!autoSaveEnabled) return;
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      if(el.saveStatus){
        el.saveStatus.textContent=t('ui.saved');
        setTimeout(()=>{ if(autoSaveEnabled && el.saveStatus) el.saveStatus.textContent='ON'; },900);
      }
    }catch(err){ console.warn(err); }
  };

  syncAutoSaveControl=function(){
    if(el.autosave) el.autosave.checked=autoSaveEnabled;
    if(el.saveStatus) el.saveStatus.textContent=autoSaveEnabled ? 'ON' : 'OFF';
  };

  const baseSyncControlsI18n=syncControls;
  syncControls=function(){
    baseSyncControlsI18n();
    if(!state.titleCustomized && el.title) el.title.value=t('pdf.defaultTitle');
    syncSelectOptionText();
  };

  const baseChangedI18n=changed;
  changed=function(){
    baseChangedI18n();
    localizeGeneratedEditors();
  };

  function automaticCreditExampleFor(lang){
    const date=String(state.updatedAt || '');
    const year=(date.match(/^\d{4}/)?.[0]) || String(new Date().getFullYear());
    const creator=String(state.creator || '').trim() || translate('pdf.creatorPlaceholder',lang);
    const work=String(state.workName || '').trim() || translate('pdf.workPlaceholder',lang);
    return `© ${year} ${creator} / ${work}`;
  }

  function normalizedUserCredit(value){
    return String(value || '').replace(/^\s*例[:：]\s*/,'').trim();
  }

  function pdfStatusTitle(key){
    if(key==='ask') return pdfT(state.mode==='custom' ? 'status.ask' : 'status.conditions');
    return pdfT(`status.${key}`);
  }

  function pdfStatusSubtitle(key){
    return pdfStatusTitle(key);
  }

  function localizedPolicyItem(item){
    return {...item,label:pdfT(`policy.${item.key}`)};
  }

  getGroups=function(){
    if(state.mode==='cc'){
      const d=DATA.cc[state.ccLicense];
      return {
        allow:d.allow.map(label=>({label:systemTerm(label,resolvedPdfLanguage()),icon:'✓'})),
        ask:d.ask.map(label=>({label:systemTerm(label,resolvedPdfLanguage()),icon:'!'})),
        deny:d.deny.map(label=>({label:systemTerm(label,resolvedPdfLanguage()),icon:'×'}))
      };
    }
    if(state.mode==='software'){
      const d=DATA.software[state.softwareLicense];
      return {
        allow:d.allow.map(label=>({label:systemTerm(label,resolvedPdfLanguage()),icon:'✓'})),
        ask:d.ask.map(label=>({label:systemTerm(label,resolvedPdfLanguage()),icon:'!'})),
        deny:d.deny.map(label=>({label:systemTerm(label,resolvedPdfLanguage()),icon:'×'}))
      };
    }
    const groups={allow:[],ask:[],deny:[]};
    DATA.policyItems.forEach(item=>groups[state.policies[item.key]].push(localizedPolicyItem(item)));
    return groups;
  };

  restrictionLabels=function(){
    if(state.mode!=='custom') return [];
    return Object.entries(state.restrictions || {})
      .filter(([,enabled])=>enabled)
      .map(([key])=>readPath(I18N.ja,`restriction.${key}`) ? pdfT(`restriction.${key}`) : key);
  };

  bottomNote=function(){
    if(state.mode==='custom'){
      const custom=String(state.notes || '').trim();
      return custom || pdfT('pdf.customFallbackNote');
    }
    if(state.mode==='cc') return pdfT('pdf.ccFollowTerms',{license:state.ccLicense});
    const custom=String(state.softwareNotes || '').trim();
    if(custom) return custom;
    return translate(`softwareNote.${state.softwareLicense}`,resolvedPdfLanguage());
  };

  shouldShowCreditStrip=function(){
    if(state.mode==='software') return true;
    if(state.mode==='custom') return state.credit!=='none';
    if(state.mode==='cc'){
      if(state.ccLicense==='CC0 1.0') return Boolean(normalizedUserCredit(state.ccCreditText));
      return true;
    }
    return true;
  };

  creditStripContent=function(){
    const lang=resolvedPdfLanguage();
    if(state.mode==='custom'){
      const headline=state.credit==='required'
        ? translate('pdf.creditRequired',lang)
        : state.credit==='recommended'
          ? translate('pdf.creditRecommended',lang)
          : translate('pdf.creditNotRequired',lang);
      if(state.credit==='none') return {headline,detail:''};
      const example=normalizedUserCredit(state.creditText) || automaticCreditExampleFor(lang);
      return {headline,detail:`${translate('pdf.examplePrefix',lang)}: ${example}`};
    }
    if(state.mode==='cc'){
      const isZero=state.ccLicense==='CC0 1.0';
      const headline=translate(isZero?'pdf.creditNotRequired':'pdf.creditRequired',lang);
      const entered=normalizedUserCredit(state.ccCreditText);
      if(isZero) return {headline,detail:entered ? `${translate('pdf.optionalExamplePrefix',lang)}: ${entered}` : ''};
      const example=entered || automaticCreditExampleFor(lang);
      return {headline,detail:`${translate('pdf.examplePrefix',lang)}: ${example}`};
    }
    return {headline:translate('pdf.softwareCredit',lang),detail:''};
  };

  creditStripStatusLabel=function(){
    if(state.mode==='software') return pdfT('pdf.statusLicenseNotice');
    if(state.mode==='custom'){
      if(state.credit==='recommended') return pdfT('pdf.statusRecommended');
      if(state.credit==='none') return pdfT('pdf.statusNotRequired');
      return pdfT('pdf.statusRequired');
    }
    if(state.ccLicense==='CC0 1.0') return pdfT('pdf.statusNotRequired');
    return pdfT('pdf.statusRequired');
  };

  const CONTENT_SHIFT=typeof PDF_CONTENT_SHIFT_Y==='number' ? PDF_CONTENT_SHIFT_Y : 36;

  drawHeader=function(ctx,theme){
    const left=78;
    const shift=CONTENT_SHIFT;
    ctx.fillStyle=theme.muted;
    ctx.font=weight(700,15);
    ctx.letterSpacing='1px';
    ctx.fillText(pdfT('pdf.kicker'),left,78+shift);
    ctx.letterSpacing='0px';

    const title=(state.titleCustomized && String(state.title || '').trim()) ? String(state.title).trim() : pdfT('pdf.defaultTitle');
    ctx.fillStyle=theme.ink;
    let titleSize=53;
    while(titleSize>36){
      ctx.font=weight(800,titleSize);
      if(ctx.measureText(title).width<=820) break;
      titleSize-=1;
    }
    ctx.fillText(title,left,151+shift);

    const work=String(state.workName || '').trim() || pdfT('pdf.thisWork');
    const description=pdfT('pdf.description',{work});
    ctx.fillStyle=theme.muted;
    drawAdaptiveSentence(ctx,description,left,207+shift,710);

    if(illustration){
      const x=958,y=61+shift,w=202,h=202;
      ctx.save(); roundedPath(ctx,x,y,w,h,12); ctx.clip(); drawImageCover(ctx,illustration,x,y,w,h); ctx.restore();
      strokeRound(ctx,x,y,w,h,12,theme.lineStrong,1);
    }
  };

  drawMeta=function(ctx,theme){
    const x=78,y=316+CONTENT_SHIFT,w=1084,h=104;
    ctx.fillStyle=theme.wash; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle=theme.lineStrong; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.stroke();

    const typeLabel=readPath(I18N.ja,`workType.${state.workType}`) ? pdfT(`workType.${state.workType}`) : (state.workType || '—');
    const items=[[pdfT('pdf.metaCreator'),state.creator||'—'],[pdfT('pdf.metaWork'),state.workName||'—'],[pdfT('pdf.metaType'),typeLabel],[pdfT('pdf.metaUpdated'),state.updatedAt||'—']];
    const colW=w/4;
    items.forEach((it,i)=>{
      const xx=x+i*colW+20;
      if(i>0){ ctx.strokeStyle=theme.line; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+i*colW,y+22); ctx.lineTo(x+i*colW,y+h-22); ctx.stroke(); }
      ctx.fillStyle=theme.muted; ctx.font=weight(600,13); ctx.fillText(it[0],xx,y+32);
      ctx.fillStyle=theme.ink; ctx.font=weight(700,19); ctx.fillText(short(it[1],18),xx,y+67);
    });
  };

  drawStatusPanels=function(ctx,theme){
    const groups=getGroups();
    const y=468+CONTENT_SHIFT,w=349,gap=18;
    let h=620;
    if(state.mode==='cc'){
      const maxItems=Math.max(1,groups.allow.length,groups.ask.length,groups.deny.length);
      h=Math.max(270,Math.min(390,126+maxItems*66+28));
    }else if(state.mode==='software'){
      const maxItems=Math.max(1,groups.allow.length,groups.ask.length,groups.deny.length);
      h=Math.max(285,Math.min(430,126+maxItems*66+28));
    }
    ['allow','ask','deny'].forEach((key,i)=>drawPanel(ctx,78+i*(w+gap),y,w,h,key,groups[key],theme));
    return {y,height:h,bottom:y+h};
  };

  drawPanel=function(ctx,x,y,w,h,key,items,theme){
    const sc=EDITORIAL_STATUS[key];
    roundedFill(ctx,x,y,w,h,12,sc.tint); strokeRound(ctx,x,y,w,h,12,theme.line,1);
    drawStatusGlyph(ctx,key,x+34,y+43,sc.ink);
    ctx.fillStyle=theme.ink; ctx.font=weight(730,26); ctx.fillText(pdfStatusTitle(key),x+65,y+50);
    ctx.fillStyle=theme.muted; ctx.font=weight(600,11.5); ctx.fillText(pdfStatusSubtitle(key),x+66,y+71);
    ctx.strokeStyle=hexAlpha(theme.ink,.09); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+22,y+94); ctx.lineTo(x+w-22,y+94); ctx.stroke();

    if(!items.length){ ctx.fillStyle=theme.faint; ctx.font=weight(500,15); ctx.fillText(pdfT('pdf.none'),x+24,y+142); return; }
    const available=h-118;
    const count=Math.min(items.length,12);
    const rowH=Math.max(39,Math.min(66,available/count));
    items.slice(0,12).forEach((item,idx)=>{
      const yy=y+112+idx*rowH;
      if(idx>0){ ctx.strokeStyle=hexAlpha(theme.ink,.065); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x+22,yy); ctx.lineTo(x+w-22,yy); ctx.stroke(); }
      const centerY=yy+rowH/2-1;
      drawPolicyIcon(ctx,item,x+38,centerY,sc.icon);
      ctx.fillStyle=theme.ink;
      const fontSize=rowH<46?14.2:rowH<54?15.5:17;
      ctx.font=weight(620,fontSize);
      drawCenteredPolicyLabel(ctx,item.label,x+65,centerY,w-89);
    });
  };

  drawCcLicenseStrip=function(ctx,theme,y){
    const x=78,w=1084,h=148;
    const license=DATA.cc[state.ccLicense];
    roundedFill(ctx,x,y,w,h,10,theme.wash); strokeRound(ctx,x,y,w,h,10,theme.line,1);
    ctx.fillStyle=theme.muted; ctx.font=weight(650,12); ctx.fillText(pdfT('pdf.ccLicenseKicker'),x+24,y+31);
    const badgeX=x+24,badgeY=y+51,badgeW=176;
    if(typeof ccOfficialBadge!=='undefined'&&ccOfficialBadge){
      const ratio=(ccOfficialBadge.naturalHeight/ccOfficialBadge.naturalWidth)||31/88;
      ctx.drawImage(ccOfficialBadge,badgeX,badgeY,badgeW,Math.round(badgeW*ratio));
    }else{
      roundedFill(ctx,badgeX,badgeY,badgeW,62,6,'#111111'); ctx.fillStyle='#ffffff'; ctx.font=weight(750,22); ctx.fillText(state.ccLicense,badgeX+16,badgeY+38);
    }
    const textX=x+234;
    ctx.fillStyle=theme.ink; ctx.font=weight(700,21); ctx.fillText(state.ccLicense,textX,y+66);
    ctx.fillStyle=theme.muted; ctx.font=weight(500,13.5); drawBalancedText(ctx,license.url,textX,y+94,560,20,2);
    ctx.fillStyle=theme.faint; ctx.font=weight(500,11.5); ctx.textAlign='right'; ctx.fillText(pdfT('pdf.ccOfficial'),x+w-24,y+66); ctx.textAlign='left';
  };

  drawSoftwareLicenseStrip=function(ctx,theme,y){
    const x=78,w=1084,h=146;
    const license=DATA.software[state.softwareLicense];
    const meta=typeof ossMeta==='function' ? ossMeta() : {name:state.softwareLicense,spdx:state.softwareLicense};
    const scope=String(state.softwareScope || '').trim();
    roundedFill(ctx,x,y,w,h,10,theme.wash); strokeRound(ctx,x,y,w,h,10,theme.line,1);
    ctx.fillStyle=theme.muted; ctx.font=weight(650,12); ctx.fillText(pdfT('pdf.softwareLicenseKicker'),x+24,y+30);
    roundedFill(ctx,x+24,y+49,58,58,8,'#ffffff'); strokeRound(ctx,x+24,y+49,58,58,8,theme.line,1);
    ctx.fillStyle=theme.muted; ctx.font=weight(700,15); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('</>',x+53,y+78); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    const textX=x+108;
    ctx.fillStyle=theme.ink; ctx.font=weight(720,22); ctx.fillText(meta.name,textX,y+68);
    ctx.fillStyle=theme.muted; ctx.font=weight(520,12.5); ctx.fillText(`SPDX: ${meta.spdx}`,textX,y+94);
    if(license?.url){ ctx.fillStyle=theme.faint; ctx.font=weight(500,11.5); drawBalancedText(ctx,license.url,textX,y+118,520,17,2); }
    if(scope){
      const rightX=x+745;
      ctx.fillStyle=theme.muted; ctx.font=weight(650,11.5); ctx.fillText(pdfT('pdf.softwareScope'),rightX,y+52);
      ctx.fillStyle=theme.ink; ctx.font=weight(520,12.5); drawBalancedText(ctx,scope,rightX,y+78,w-(rightX-x)-24,19,3);
    }else{
      ctx.fillStyle=theme.faint; ctx.font=weight(500,11.5); ctx.textAlign='right'; ctx.fillText(pdfT('pdf.softwareStandard'),x+w-24,y+70); ctx.textAlign='left';
    }
  };

  drawCreditStrip=function(ctx,theme,y){
    const x=78,w=1084,h=132;
    const content=creditStripContent();
    const tone=creditTone();
    roundedFill(ctx,x,y,w,h,10,tone.fill); strokeRound(ctx,x,y,w,h,10,tone.border,1);
    if(tone.railWidth>0){ ctx.save(); ctx.strokeStyle=tone.accent; ctx.lineWidth=tone.railWidth; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x+tone.railWidth/2,y+22); ctx.lineTo(x+tone.railWidth/2,y+h-22); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle=tone.kicker; ctx.font=weight(650,12); ctx.fillText(pdfT('pdf.creditKicker'),x+24,y+29);
    const centerY=y+76,iconX=x+50,iconSize=54,iconTop=centerY-iconSize/2;
    roundedFill(ctx,x+24,iconTop,iconSize,iconSize,8,tone.iconFill); strokeRound(ctx,x+24,iconTop,iconSize,iconSize,8,tone.iconBorder,1);
    drawBottomIcon(ctx,'credit',iconX,centerY,{...theme,muted:tone.accent});
    const textX=x+104,maxTextWidth=680;
    ctx.font=weight(700,20);
    const headlineLines=balancedTextLines(ctx,content.headline||pdfT('pdf.creditKicker'),maxTextWidth,2);
    let detailLines=[];
    if(content.detail){ ctx.font=weight(500,13.5); detailLines=balancedTextLines(ctx,content.detail,maxTextWidth,2); }
    const headlineLineHeight=24,detailLineHeight=18,blockGap=detailLines.length?6:0;
    const totalHeight=headlineLines.length*headlineLineHeight+blockGap+detailLines.length*detailLineHeight;
    let cursorY=centerY-totalHeight/2;
    ctx.save(); ctx.textBaseline='middle'; ctx.fillStyle=theme.ink; ctx.font=weight(700,20);
    headlineLines.forEach((line,i)=>ctx.fillText(line,textX,cursorY+headlineLineHeight/2+i*headlineLineHeight));
    cursorY+=headlineLines.length*headlineLineHeight+blockGap;
    if(detailLines.length){ ctx.fillStyle=theme.muted; ctx.font=weight(500,13.5); detailLines.forEach((line,i)=>ctx.fillText(line,textX,cursorY+detailLineHeight/2+i*detailLineHeight)); }
    ctx.restore();
    ctx.fillStyle=tone.label; ctx.font=weight(tone.railWidth===4?700:650,11.5); ctx.textAlign='right'; ctx.textBaseline='middle'; ctx.fillText(creditStripStatusLabel(),x+w-24,centerY); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  };

  function drawPreservedUserText(ctx,text,x,y,maxWidth,lineHeight,maxLines){
    const paragraphs=String(text || '').split(/\r?\n/);
    let drawn=0;
    for(const paragraph of paragraphs){
      if(drawn>=maxLines) break;
      if(!paragraph){ drawn+=1; continue; }
      const segments=textSegments(paragraph);
      let line='';
      for(const segment of segments){
        const candidate=line+segment;
        if(line && ctx.measureText(candidate).width>maxWidth){
          ctx.fillText(line,x,y+drawn*lineHeight); drawn+=1; line=segment;
          if(drawn>=maxLines) break;
        }else line=candidate;
      }
      if(drawn>=maxLines) break;
      if(line){ ctx.fillText(line,x,y+drawn*lineHeight); drawn+=1; }
    }
    return drawn;
  }

  drawBottom=function(ctx,theme,y=1268,footerY=1608){
    const x=78,w=1084;
    ctx.strokeStyle=theme.lineStrong; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.stroke();
    const hasContact=Boolean(String(state.contact||'').trim());
    const sections=hasContact
      ? [{x,w:760,title:pdfT('pdf.note'),kind:'note'},{x:x+760,w:324,title:pdfT('pdf.contact'),kind:'contact'}]
      : [{x,w:1084,title:pdfT('pdf.note'),kind:'note'}];

    sections.forEach((s,i)=>{
      if(i>0){ ctx.strokeStyle=theme.line; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(s.x,y+28); ctx.lineTo(s.x,y+222); ctx.stroke(); }
      const px=s.x+20;
      drawBottomIcon(ctx,s.kind,px+9,y+40,theme);
      ctx.fillStyle=theme.ink; ctx.font=weight(650,13); ctx.fillText(s.title,px,y+76);
      ctx.fillStyle=theme.muted; ctx.font=weight(500,14);

      if(s.kind==='contact'){
        drawFlexibleBlock(ctx,String(state.contact).trim(),px,y+110,s.w-40,6);
        return;
      }

      const maxWidth=s.w-42;
      if(state.mode==='cc'){
        const fixed=bottomNote();
        const fixedLines=balancedTextLines(ctx,fixed,maxWidth,2);
        fixedLines.forEach((line,index)=>ctx.fillText(line,px,y+110+index*23));
        const custom=String(state.ccNotes || '').trim();
        if(custom){
          const start=y+110+fixedLines.length*23+8;
          drawPreservedUserText(ctx,custom,px,start,maxWidth,22,Math.max(1,6-fixedLines.length));
        }
      }else if(state.mode==='custom' && String(state.notes || '').trim()){
        drawPreservedUserText(ctx,state.notes,px,y+110,maxWidth,22,6);
      }else if(state.mode==='software' && String(state.softwareNotes || '').trim()){
        drawPreservedUserText(ctx,state.softwareNotes,px,y+110,maxWidth,22,6);
      }else{
        drawFlexibleBlock(ctx,bottomNote(),px,y+110,maxWidth,6);
      }
    });

    ctx.strokeStyle=theme.line; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,footerY); ctx.lineTo(x+w,footerY); ctx.stroke();
    ctx.fillStyle='#a0a8b3'; ctx.font=weight(500,11.5); ctx.fillText(pdfT('pdf.footerCreated'),x,footerY+31);
    ctx.textAlign='right'; ctx.fillText('https://fugu0141.github.io/License_Creator/',x+w,footerY+31); ctx.textAlign='left';
  };

  function bindLanguageControls(){
    const uiSelect=document.querySelector('#uiLanguageSelect');
    const pdfSelect=document.querySelector('#pdfLanguageSelect');

    if(uiSelect && !uiSelect.dataset.i18nBound){
      uiSelect.dataset.i18nBound='true';
      uiSelect.value=state.uiLanguage;
      uiSelect.addEventListener('change',()=>{
        state.uiLanguage=languageOrFallback(uiSelect.value);
        applyUiLanguage();
        renderResults();
        if(state.pdfLanguage==='same') queueRender();
        saveState();
      });
    }

    if(pdfSelect && !pdfSelect.dataset.i18nBound){
      pdfSelect.dataset.i18nBound='true';
      pdfSelect.value=state.pdfLanguage;
      pdfSelect.addEventListener('change',()=>{
        state.pdfLanguage=PDF_LANGUAGE_VALUES.includes(pdfSelect.value) ? pdfSelect.value : 'same';
        syncSelectOptionText();
        queueRender();
        saveState();
      });
    }

    const titleInput=document.querySelector('#titleInput');
    if(titleInput && !titleInput.dataset.i18nTitleBound){
      titleInput.dataset.i18nTitleBound='true';
      titleInput.addEventListener('input',()=>{ state.titleCustomized=true; },true);
    }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    migrateLanguageState();
    bindLanguageControls();
    applyUiLanguage();
    renderResults();
    syncAutoSaveControl();
    queueRender();
    // Persist migration only for users who explicitly enabled autosave.
    saveState();
  });
})();
