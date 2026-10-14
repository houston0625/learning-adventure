/* 皮皮學習樂園：課程目錄（全站共用）。
   每一科 → 單元 → 課。各科的單元、課的名稱寫法可以不一樣，照課本寫就好。
   新增一課時，在這裡加一行；「回報問題」的選單會自動更新。
   dir／file 是網頁放的資料夾和檔名：在某一課（或某一單元）按「回報問題」時，靠它自動帶入目前的科目、單元、課。
   open:false 的科目代表還沒開放，不會出現在「回報問題」的選項裡；開放後改成 open:true。 */
window.CATALOG = [
  {
    id: 'chinese', name: '國語', open: true, dir: 'chinese',
    units: [
      { name: '第一單元', dir: 'unit-1', lessons: [
        { name: '第一課 水陸小高手', file: 'lesson-1.html' },
        { name: '第二課 放學後', file: 'lesson-2.html' },
        { name: '第二課補充 成語挑戰', file: 'idioms-2.html' },
        { name: '第三課 我的籃球夢', file: 'lesson-3.html' },
        { name: '第三課補充 成語挑戰', file: 'idioms-3.html' }
      ] },
      { name: '第二單元', dir: 'unit-2', lessons: [
        { name: '第四課 永遠的馬偕', file: 'lesson-4.html' },
        { name: '第四課補充 成語挑戰', file: 'idioms-4.html' },
        { name: '第五課 假如給我三天光明', file: 'lesson-5.html' },
        { name: '第五課補充 成語挑戰', file: 'idioms-5.html' },
        { name: '第六課 攀登生命的高峰', file: 'lesson-6.html' },
        { name: '第六課補充 成語挑戰', file: 'idioms-6.html' }
      ] }
    ]
  },
  {
    id: 'english', name: '英文', open: true, dir: 'english',
    units: [
      { name: 'Wonder World 3（四上）', dir: 'ww3', lessons: [
        { name: 'Unit 1 The Big Wind', file: 'unit-1.html' }
      ] }
    ]
  },
  {
    id: 'science', name: '自然', open: true, dir: 'science',
    units: [
      { name: '第 1 單元 閃亮的天空', dir: 'unit-1', lessons: [
        { name: '1-1 一天的天空', file: 'lesson-1-1.html' },
        { name: '1-2 月亮的位置', file: 'lesson-1-2.html' },
        { name: '1-3 月相的變化', file: 'lesson-1-3.html' }
      ] }
    ]
  },
  {
    id: 'social', name: '社會', open: true, dir: 'social',
    units: [
      { name: '第一單元 家鄉的自然環境', dir: 'unit-1', lessons: [
        { name: '1-1 家鄉在哪裡', file: 'lesson-1-1.html' },
        { name: '1-2 家鄉的地形', file: 'lesson-1-2.html' },
        { name: '1-3 氣候、水資源與生活', file: 'lesson-1-3.html' }
      ] },
      { name: '第二單元 家鄉的傳統住屋與器物', dir: 'unit-2', lessons: [
        { name: '2-1 傳統住屋與生活', file: 'lesson-2-1.html' },
        { name: '2-2 器物與生活', file: 'lesson-2-2.html' }
      ] }
    ]
  }
];
