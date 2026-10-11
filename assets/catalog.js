/* 皮皮學習樂園：課程目錄（全站共用）。
   每一科 → 單元 → 課。各科的單元、課的名稱寫法可以不一樣，照課本寫就好。
   新增一課時，在這裡加一行；「回報問題」的選單會自動更新。
   open:false 的科目代表還沒開放（回報時只能選「整個科目」）。 */
window.CATALOG = [
  {
    id: 'chinese', name: '國語', open: true,
    units: [
      { name: '第一單元', lessons: ['第一課 水陸小高手', '第二課 放學後', '第三課 我的籃球夢'] },
      { name: '第二單元', lessons: ['第四課 永遠的馬偕', '第四課補充 成語挑戰', '第五課 假如給我三天光明'] }
    ]
  },
  {
    id: 'english', name: '英文', open: false, units: []
  },
  {
    id: 'science', name: '自然', open: true,
    units: [
      { name: '第 1 單元 閃亮的天空', lessons: ['1-1 一天的天空', '1-2 月亮的位置', '1-3 月相的變化'] }
    ]
  },
  {
    id: 'social', name: '社會', open: false, units: []
  }
];
