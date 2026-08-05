import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './public' }))

app.get('/', (c) => {
  return c.html(getIndexHTML())
})

function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EBISU PIM — 株式会社なかし</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap');
    * { font-family: 'Noto Sans JP', sans-serif; }
    .sidebar-item:hover { background: rgba(255,255,255,0.1); }
    .sidebar-item.active { background: rgba(255,255,255,0.15); border-left: 3px solid #f59e0b; }
    .product-row:hover { background-color: #f8fafc; cursor:pointer; }
    .sync-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .sync-dot.ok  { background: #22c55e; }
    .sync-dot.warn{ background: #f59e0b; }
    .sync-dot.err { background: #ef4444; }
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:50; }
    .modal-overlay.show { display:flex; align-items:center; justify-content:center; }
    .channel-card { transition: all 0.2s; }
    .channel-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.1); }
    .notification { animation: slideIn 0.3s ease; }
    @keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
    .scope-badge { font-size:10px; padding:1px 6px; border-radius:9999px; background:#f59e0b; color:#fff; font-weight:600; }
    .scope-badge-blue { font-size:10px; padding:1px 6px; border-radius:9999px; background:#3b82f6; color:#fff; font-weight:600; }
    .detail-panel { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from{opacity:0; transform:translateX(16px);} to{opacity:1; transform:translateX(0);} }
    .img-thumb { aspect-ratio:1; object-fit:cover; background:linear-gradient(135deg,#f8f9fa,#e9ecef); display:flex; align-items:center; justify-content:center; }
    .progress-bar { height:6px; border-radius:9999px; background:#e5e7eb; overflow:hidden; }
    .progress-fill { height:100%; border-radius:9999px; transition: width 0.6s ease; }
  </style>
</head>
<body class="bg-gray-50">
<div id="app" x-data="pimApp()" x-init="init()">

<!-- ========== SIDEBAR ========== -->
<aside class="fixed left-0 top-0 h-full w-60 bg-gradient-to-b from-slate-800 to-slate-900 text-white z-40 flex flex-col">
  <div class="p-5 border-b border-slate-700">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
        <i class="fas fa-gem text-white text-sm"></i>
      </div>
      <div>
        <div class="font-bold text-base leading-tight">EBISU PIM</div>
        <div class="text-slate-400 text-xs">株式会社なかし</div>
      </div>
    </div>
  </div>

  <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
    <p class="text-slate-500 text-xs uppercase px-3 pt-2 pb-1 tracking-wider">メイン</p>

    <button @click="page='dashboard'" :class="page==='dashboard'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-home w-4 text-center opacity-70"></i>
      <span>ダッシュボード</span>
    </button>

    <button @click="page='products'" :class="page==='products'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-box w-4 text-center opacity-70"></i>
      <span>商品マスタ</span>
      <span class="ml-auto scope-badge">No.1</span>
    </button>

    <button @click="page='images'" :class="page==='images'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-images w-4 text-center opacity-70"></i>
      <span>画像管理</span>
      <span class="ml-auto scope-badge">No.2</span>
    </button>

    <button @click="page='prices'" :class="page==='prices'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-yen-sign w-4 text-center opacity-70"></i>
      <span>価格管理</span>
      <span class="ml-auto scope-badge">No.4</span>
    </button>

    <button @click="page='channels'" :class="page==='channels'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-share-nodes w-4 text-center opacity-70"></i>
      <span>EC連携設定</span>
    </button>

    <button @click="page='export'" :class="page==='export'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-file-export w-4 text-center opacity-70"></i>
      <span>フォーマットDL</span>
    </button>

    <button @click="page='sale'" :class="page==='sale'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-tags w-4 text-center opacity-70"></i>
      <span>セール履歴管理</span>
    </button>

    <button @click="page='datalink'; datalinkPage='top'" :class="page==='datalink'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-plug w-4 text-center opacity-70"></i>
      <span>データ連携</span>
    </button>

    <p class="text-slate-500 text-xs uppercase px-3 pt-4 pb-1 tracking-wider">連携</p>

    <button @click="page='emacs'" :class="page==='emacs'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-database w-4 text-center opacity-70"></i>
      <span>EMACS連携</span>
      <span class="ml-auto scope-badge-blue">No.3</span>
    </button>

    <button @click="page='box'" :class="page==='box'?'active':''" class="sidebar-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-200">
      <i class="fas fa-cloud w-4 text-center opacity-70"></i>
      <span>BOX連携</span>
      <span class="ml-auto scope-badge-blue">No.5</span>
    </button>
  </nav>

  <div class="p-3 border-t border-slate-700">
    <div class="flex items-center gap-2 px-2 py-2">
      <div class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold">日</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">山田 太郎</div>
        <div class="text-slate-400 text-xs">情報システム部</div>
      </div>
    </div>
  </div>
</aside>

<!-- ========== MAIN ========== -->
<main class="ml-60 min-h-screen flex flex-col">

  <!-- Top bar -->
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
    <div class="text-sm text-gray-400" x-text="breadcrumb()"></div>
    <div class="flex items-center gap-5">
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="sync-dot ok"></span> EMACS 09:30同期済
      </div>
      <div class="flex items-center gap-1.5 text-xs text-gray-500">
        <span class="sync-dot ok"></span> BOX 同期済
      </div>
      <button class="relative p-2 text-gray-400 hover:text-gray-600">
        <i class="fas fa-bell"></i>
        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>
  </header>

  <!-- ================================================================
       PAGE: DASHBOARD
  ================================================================ -->
  <section x-show="page==='dashboard'" class="p-6 flex-1">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-800">ダッシュボード</h1>
      <p class="text-sm text-gray-500 mt-0.5">EBISU PIM — 株式会社なかし</p>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">総商品数</span>
          <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <i class="fas fa-box text-blue-500 text-sm"></i>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800">1,284</div>
        <div class="text-xs text-green-600 mt-1"><i class="fas fa-arrow-up"></i> 先月比 +23</div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">管理画像数</span>
          <div class="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <i class="fas fa-images text-purple-500 text-sm"></i>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800">8,432</div>
        <div class="text-xs text-green-600 mt-1"><i class="fas fa-arrow-up"></i> 今週 +156</div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">連携チャネル</span>
          <div class="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
            <i class="fas fa-share-nodes text-amber-500 text-sm"></i>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800">9</div>
        <div class="text-xs text-gray-500 mt-1">自動4 / 手動5</div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm text-gray-500">今月の価格改定</span>
          <div class="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center">
            <i class="fas fa-yen-sign text-rose-500 text-sm"></i>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-800">47</div>
        <div class="text-xs text-blue-600 mt-1">次回: 2026/06/15</div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <!-- Activity -->
      <div class="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-700 text-sm">最近のアクティビティ</h3>
          <span class="text-xs text-gray-400">本日</span>
        </div>
        <div class="divide-y divide-gray-50">
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-sync text-green-600 text-xs"></i></div>
            <div class="flex-1"><div class="text-gray-700">EMACSから商品マスタを取込</div><div class="text-gray-400 text-xs">23件更新 · 09:30</div></div>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
          </div>
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-images text-purple-600 text-xs"></i></div>
            <div class="flex-1"><div class="text-gray-700">BOXから画像を自動取込（命名規則で商品コード認識）</div><div class="text-gray-400 text-xs">156枚 · 08:15</div></div>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
          </div>
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-yen-sign text-amber-600 text-xs"></i></div>
            <div class="flex-1"><div class="text-gray-700">価格改定を楽天・Amazonへ自動反映</div><div class="text-gray-400 text-xs">47件 · 昨日 23:00</div></div>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
          </div>
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-file-export text-blue-600 text-xs"></i></div>
            <div class="flex-1"><div class="text-gray-700">ZOZOTOWN フォーマット CSV をエクスポート</div><div class="text-gray-400 text-xs">312件 · 昨日 16:45</div></div>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">完了</span>
          </div>
          <div class="px-4 py-3 flex items-center gap-3 text-sm">
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-exclamation text-red-600 text-xs"></i></div>
            <div class="flex-1"><div class="text-gray-700">Amazon 連携エラー — 商品コード不一致</div><div class="text-gray-400 text-xs">3件 要確認 · 昨日 12:20</div></div>
            <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">要対応</span>
          </div>
        </div>
      </div>

      <!-- Channel status -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div class="p-4 border-b border-gray-100"><h3 class="font-semibold text-gray-700 text-sm">ECチャネル状況</h3></div>
        <div class="p-4 space-y-2.5 text-sm">
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>楽天市場</div><span class="text-xs text-gray-400">自動</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot warn"></span>Amazon</div><span class="text-xs text-red-500">3件エラー</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>TSUNAGU</div><span class="text-xs text-gray-400">自動</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>ZOZOTOWN</div><span class="text-xs text-gray-400">価格のみ自動</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>マルイウェブ</div><span class="text-xs text-gray-400">価格のみ自動</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>Shopify (NKS)</div><span class="text-xs text-gray-400">価格のみ自動</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>Shopify (Zsys)</div><span class="text-xs text-gray-400">価格のみ自動</span></div>
          <div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="sync-dot ok"></span>BLOOM (PVS)</div><span class="text-xs text-gray-400">価格のみ自動</span></div>
        </div>
      </div>
    </div>

    <!-- Project progress -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-700 text-sm">プロジェクト進捗</h3>
        <span class="text-xs text-gray-400">2026年6月〜2027年3月</span>
      </div>
      <div class="space-y-3">
        <div><div class="flex justify-between text-xs mb-1"><span class="font-medium text-amber-600">① 要件定義</span><span class="text-gray-400">6〜7月</span></div><div class="progress-bar"><div class="progress-fill bg-amber-400" style="width:15%"></div></div></div>
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">② 基本設計</span><span class="text-gray-400">8〜9月</span></div><div class="progress-bar"><div class="progress-fill bg-gray-200" style="width:0%"></div></div></div>
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">③ 開発</span><span class="text-gray-400">10〜12月</span></div><div class="progress-bar"><div class="progress-fill bg-gray-200" style="width:0%"></div></div></div>
        <div><div class="flex justify-between text-xs mb-1"><span class="text-gray-400">④ テスト〜本番稼働</span><span class="text-gray-400">1〜3月</span></div><div class="progress-bar"><div class="progress-fill bg-gray-200" style="width:0%"></div></div></div>
      </div>
      <div class="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
        <i class="fas fa-star-of-life text-amber-400"></i> 現在：要件定義フェーズ（第1回 キックオフ実施中）
      </div>
    </div>
  </section>

  <!-- ================================================================
       PAGE: PRODUCTS (No.1)
  ================================================================ -->
  <section x-show="page==='products'" class="p-6 flex-1">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="scope-badge text-xs">No.1</span>
          <h1 class="text-xl font-bold text-gray-800">商品マスタ 一覧</h1>
        </div>
        <p class="text-sm text-gray-500">SKUが多いため商品単位での一覧閲覧・管理</p>
      </div>
      <div class="flex gap-2">
        <button @click="notify('CSVエクスポートを開始しました','info')" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
          <i class="fas fa-file-export text-xs"></i> CSV出力
        </button>
        <button @click="openProductAdd()" class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
          <i class="fas fa-plus text-xs"></i> 商品追加
        </button>
      </div>
    </div>

    <div class="flex gap-5">
      <!-- Table area -->
      <div :class="selectedProduct ? 'w-3/5' : 'w-full'" class="transition-all">
        <!-- Filters -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-3 flex items-center gap-3 flex-wrap">
          <div class="relative flex-1 min-w-40">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
            <input type="text" placeholder="商品名・コードで検索..." x-model="prodSearch" class="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-slate-400">
          </div>
          <select x-model="prodCat" class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white">
            <option value="">カテゴリ：すべて</option>
            <option>リング</option><option>ネックレス</option><option>ピアス</option><option>ブレスレット</option><option>ブローチ</option>
          </select>
          <select x-model="prodStatus" class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white">
            <option value="">ステータス：すべて</option>
            <option>公開中</option><option>非公開</option>
          </select>
          <span class="text-xs text-gray-400 ml-auto" x-text="filteredProds().length + '件'"></span>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs w-6"><input type="checkbox" class="rounded"></th>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">商品</th>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">コード</th>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">SKU</th>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">画像</th>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">価格</th>
                <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">ステータス</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <template x-for="p in filteredProds()" :key="p.id">
                <tr class="product-row" @click="selectedProduct = p">
                  <td class="px-4 py-3"><input type="checkbox" class="rounded" @click.stop></td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" :class="p.iconBg">
                        <i class="fas fa-gem text-xs" :class="p.iconColor"></i>
                      </div>
                      <div>
                        <div class="font-medium text-gray-800 text-xs leading-tight" x-text="p.name"></div>
                        <div class="text-gray-400 text-xs" x-text="p.category"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-500" x-text="p.code"></td>
                  <td class="px-4 py-3 text-center"><span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs" x-text="p.skuCount+'件'"></span></td>
                  <td class="px-4 py-3 text-xs" :class="p.imgCount>0?'text-gray-600':'text-red-400'">
                    <i class="fas fa-image mr-0.5"></i><span x-text="p.imgCount"></span>
                  </td>
                  <td class="px-4 py-3 text-xs font-semibold text-gray-700" x-text="'¥'+p.price.toLocaleString()"></td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full" :class="p.status==='公開中'?'bg-green-50 text-green-600':'bg-gray-100 text-gray-500'" x-text="p.status"></span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>1〜10件 / 全1,284件</span>
            <div class="flex items-center gap-1">
              <button class="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50">前へ</button>
              <button class="px-2.5 py-1 rounded bg-slate-800 text-white">1</button>
              <button class="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50">2</button>
              <button class="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50">次へ</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail panel -->
      <div x-show="selectedProduct" class="w-2/5 detail-panel">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-20">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <span class="font-semibold text-gray-700 text-sm">商品詳細</span>
            <button @click="selectedProduct=null" class="text-gray-400 hover:text-gray-600 text-xs"><i class="fas fa-times"></i></button>
          </div>
          <template x-if="selectedProduct">
            <div>
              <!-- Image placeholder -->
              <div class="m-4 rounded-lg h-40 flex items-center justify-center" :class="selectedProduct.iconBg">
                <i class="fas fa-gem text-4xl" :class="selectedProduct.iconColor"></i>
              </div>
              <div class="px-4 pb-4 space-y-3">
                <div>
                  <div class="font-bold text-gray-800" x-text="selectedProduct.name"></div>
                  <div class="text-gray-400 text-xs mt-0.5" x-text="selectedProduct.nameEn"></div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="bg-gray-50 rounded-lg p-2">
                    <div class="text-gray-400 mb-0.5">商品コード</div>
                    <div class="font-mono font-medium text-gray-700" x-text="selectedProduct.code"></div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2">
                    <div class="text-gray-400 mb-0.5">生産コード(EMACS)</div>
                    <div class="font-mono font-medium text-gray-700" x-text="selectedProduct.emacsCode"></div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2">
                    <div class="text-gray-400 mb-0.5">カテゴリ</div>
                    <div class="font-medium text-gray-700" x-text="selectedProduct.category"></div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2">
                    <div class="text-gray-400 mb-0.5">SKU数</div>
                    <div class="font-medium text-gray-700" x-text="selectedProduct.skuCount + '件'"></div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2">
                    <div class="text-gray-400 mb-0.5">販売価格</div>
                    <div class="font-bold text-gray-800" x-text="'¥' + selectedProduct.price.toLocaleString()"></div>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2">
                    <div class="text-gray-400 mb-0.5">下代</div>
                    <div class="font-medium text-gray-700" x-text="'¥' + selectedProduct.cost.toLocaleString()"></div>
                  </div>
                </div>
                <div>
                  <div class="text-xs text-gray-400 mb-1.5">素材</div>
                  <div class="flex gap-1 flex-wrap">
                    <template x-for="m in selectedProduct.materials" :key="m">
                      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded" x-text="m"></span>
                    </template>
                  </div>
                </div>
                <div>
                  <div class="text-xs text-gray-400 mb-1.5">連携チャネル</div>
                  <div class="flex gap-1 flex-wrap">
                    <template x-for="ch in selectedProduct.channels" :key="ch">
                      <span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded" x-text="ch"></span>
                    </template>
                  </div>
                </div>
                <div class="flex gap-2 pt-1">
                  <button @click="notify('編集画面を開きました','info')" class="flex-1 py-2 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700">編集</button>
                  <button @click="page='images'" class="flex-1 py-2 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">画像を見る</button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================
       PAGE: IMAGES (No.2 + No.5)
  ================================================================ -->
  <section x-show="page==='images'" class="p-6 flex-1">
    <div class="flex items-center justify-between mb-5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="scope-badge text-xs">No.2</span>
          <span class="scope-badge-blue text-xs">No.5</span>
          <h1 class="text-xl font-bold text-gray-800">画像管理・一括ダウンロード</h1>
        </div>
        <p class="text-sm text-gray-500">BOX連携による自動取込と、PR用画像の一括ダウンロード</p>
      </div>
      <div class="flex gap-2">
        <button @click="notify('BOXから最新画像を取込中...','info')" class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
          <i class="fas fa-cloud-download-alt text-xs"></i> BOXから取込
        </button>
        <button @click="notify('選択した商品の画像をZIP形式でダウンロードします','info')" class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
          <i class="fas fa-download text-xs"></i> 一括ダウンロード
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-gray-800">8,432</div>
        <div class="text-xs text-gray-500 mt-1">総画像数</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-green-600">8,201</div>
        <div class="text-xs text-gray-500 mt-1">商品コード認識済み</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-amber-500">231</div>
        <div class="text-xs text-gray-500 mt-1">認識不可（命名規則外）</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600">156</div>
        <div class="text-xs text-gray-500 mt-1">本日追加</div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-4 flex items-center gap-3 flex-wrap">
      <div class="relative flex-1 min-w-40">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
        <input type="text" placeholder="商品コード・ファイル名で検索..." class="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-slate-400">
      </div>
      <select class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white">
        <option>種別：すべて</option><option>本画像</option><option>着用画像</option><option>詳細画像</option><option>PR用</option>
      </select>
      <select class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white">
        <option>カテゴリ：すべて</option><option>リング</option><option>ネックレス</option><option>ピアス</option>
      </select>
      <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" class="rounded"> 認識不可のみ表示
      </label>
      <div class="flex border border-gray-200 rounded-lg overflow-hidden ml-auto">
        <button class="px-3 py-1.5 bg-slate-800 text-white text-xs"><i class="fas fa-th"></i></button>
        <button class="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-xs"><i class="fas fa-list"></i></button>
      </div>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-6 gap-3">
      <template x-for="img in imgItems" :key="img.id">
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-slate-300 cursor-pointer group transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div class="relative aspect-square flex items-center justify-center" :class="img.bg">
            <i class="fas fa-gem text-2xl" :class="img.ic"></i>
            <!-- hover actions -->
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2">
              <button class="opacity-0 group-hover:opacity-100 w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-700 shadow text-xs transition-opacity" @click.stop="notify('ダウンロードしました','success')"><i class="fas fa-download"></i></button>

            </div>
            <div x-show="img.isNew" class="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">NEW</div>

          </div>
          <div class="p-2">
            <div class="text-xs text-gray-700 truncate font-medium" x-text="img.file"></div>
            <div class="text-xs text-gray-400 truncate" x-text="img.code"></div>
          </div>
        </div>
      </template>
    </div>

    <div class="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-3">
      <i class="fas fa-info-circle mt-0.5 flex-shrink-0"></i>
      <div><strong>一括ダウンロード：</strong>商品を選択して「一括ダウンロード」を押すと、PR資料用に商品画像をZIPでまとめてダウンロードできます。閲覧権限に応じて下代情報を非表示にした状態で出力可能です。</div>
    </div>
  </section>

  <!-- ================================================================
       PAGE: EMACS (No.3)
  ================================================================ -->
  <section x-show="page==='emacs'" class="p-6 flex-1">
    <div class="flex items-center justify-between mb-5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="scope-badge-blue text-xs">No.3</span>
          <h1 class="text-xl font-bold text-gray-800">EMACSからの商品マスタ取込</h1>
        </div>
        <p class="text-sm text-gray-500">基幹システムEMACSからの取込・加工・マスタ作成・更新</p>
      </div>
      <button @click="notify('手動取込を開始しました','info')" class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
        <i class="fas fa-sync text-xs"></i> 今すぐ取込
      </button>
    </div>

    <!-- Status cards -->
    <div class="grid grid-cols-4 gap-3 mb-5">
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">連携ステータス</div>
        <div class="flex items-center gap-1.5"><span class="sync-dot ok"></span><span class="font-semibold text-green-600 text-sm">正常稼働中</span></div>
        <div class="text-xs text-gray-400 mt-1">最終同期: 06/02 09:30</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">本日の取込件数</div>
        <div class="text-2xl font-bold text-gray-800">23</div>
        <div class="text-xs text-gray-400 mt-1">更新21 / 新規2</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">エラー件数</div>
        <div class="text-2xl font-bold text-amber-500">0</div>
        <div class="text-xs text-gray-400 mt-1">直近7日間</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">次回予定</div>
        <div class="text-sm font-bold text-gray-800">09:30</div>
        <div class="text-xs text-gray-400 mt-1">毎日自動実行</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-5 mb-5">
      <!-- Mapping config -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-code-branch text-slate-400"></i> 商品コードマッピング設定
        </h3>
        <div class="text-xs text-gray-500 mb-3">EMACSの12桁生産コード → PIM商品コードへの変換ルール</div>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
            <div class="w-32 font-mono text-xs text-gray-500">EMACS生産コード</div>
            <i class="fas fa-arrow-right text-gray-300 text-xs"></i>
            <div class="font-mono text-xs text-slate-700 flex-1">EST-{カテゴリ}-{連番}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2.5 text-xs font-mono">
            <div class="text-gray-400 mb-1">例：</div>
            <div>100400020305 → <span class="text-blue-600">EST-RG001</span></div>
            <div>100500031201 → <span class="text-blue-600">EST-NK002</span></div>
          </div>
          <div class="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
            <i class="fas fa-exclamation-triangle flex-shrink-0"></i>
            色・サイズのバリエーション管理ルールは要件定義第3回で確定予定
          </div>
        </div>
      </div>

      <!-- Sync config -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-cog text-slate-400"></i> 連携設定
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span class="text-gray-600">連携方式</span>
            <span class="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-medium">CSV連携（バッチ）</span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span class="text-gray-600">実行スケジュール</span>
            <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">毎日 09:30</span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span class="text-gray-600">廃番商品の扱い</span>
            <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">非公開に変更</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-gray-600">価格改定日管理</span>
            <span class="bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded border border-amber-200">⚠ EMACS仕様確認中</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Import log -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100"><h3 class="font-semibold text-gray-700 text-sm">取込ログ</h3></div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">実行日時</th>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">取込件数</th>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">更新</th>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">新規</th>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">廃番</th>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">エラー</th>
            <th class="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">状態</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 text-xs">
          <tr class="hover:bg-gray-50"><td class="px-4 py-2.5 text-gray-600">2026/06/02 09:30</td><td class="px-4 py-2.5">23</td><td class="px-4 py-2.5 text-blue-600">21</td><td class="px-4 py-2.5 text-green-600">2</td><td class="px-4 py-2.5 text-gray-400">0</td><td class="px-4 py-2.5 text-gray-400">0</td><td class="px-4 py-2.5"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
          <tr class="hover:bg-gray-50"><td class="px-4 py-2.5 text-gray-600">2026/06/01 09:30</td><td class="px-4 py-2.5">18</td><td class="px-4 py-2.5 text-blue-600">18</td><td class="px-4 py-2.5 text-green-600">0</td><td class="px-4 py-2.5 text-gray-400">0</td><td class="px-4 py-2.5 text-gray-400">0</td><td class="px-4 py-2.5"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
          <tr class="hover:bg-gray-50"><td class="px-4 py-2.5 text-gray-600">2026/05/31 09:30</td><td class="px-4 py-2.5">31</td><td class="px-4 py-2.5 text-blue-600">28</td><td class="px-4 py-2.5 text-green-600">3</td><td class="px-4 py-2.5 text-gray-400">1</td><td class="px-4 py-2.5 text-red-500">2</td><td class="px-4 py-2.5"><span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">一部エラー</span></td></tr>
          <tr class="hover:bg-gray-50"><td class="px-4 py-2.5 text-gray-600">2026/05/30 09:30</td><td class="px-4 py-2.5">11</td><td class="px-4 py-2.5 text-blue-600">11</td><td class="px-4 py-2.5 text-green-600">0</td><td class="px-4 py-2.5 text-gray-400">0</td><td class="px-4 py-2.5 text-gray-400">0</td><td class="px-4 py-2.5"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ================================================================
       PAGE: PRICES (No.4)
  ================================================================ -->
  <section x-show="page==='prices'" class="p-6 flex-1">
    <div class="flex items-center justify-between mb-5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="scope-badge text-xs">No.4</span>
          <h1 class="text-xl font-bold text-gray-800">価格管理・自動連携</h1>
        </div>
        <p class="text-sm text-gray-500">価格改定日ベースで各モール・システムへ自動反映</p>
      </div>
      <button @click="openPriceModal()" class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
        <i class="fas fa-plus text-xs"></i> 価格改定を登録
      </button>
    </div>

    <!-- Upcoming alert -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-center gap-4">
      <div class="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
        <i class="fas fa-clock text-white text-sm"></i>
      </div>
      <div class="flex-1">
        <div class="font-semibold text-amber-800 text-sm">次回の価格改定が予定されています</div>
        <div class="text-xs text-amber-700 mt-0.5">2026年6月15日 00:00 — 47件が自動更新（楽天・Amazon・TSUNAGUはAPI自動、その他は価格のみ自動）</div>
      </div>
      <button @click="notify('改定内容の確認画面を開きました','info')" class="px-3 py-2 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600">内容確認</button>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-5">
      <div class="col-span-2">
        <!-- Price table -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-700 text-sm">価格改定スケジュール</h3>
            <div class="flex gap-1">
              <button x-model="priceFilter" class="px-2.5 py-1.5 bg-slate-800 text-white rounded text-xs">今後予定</button>
              <button class="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">完了済み</button>
            </div>
          </div>
          <table class="w-full text-xs">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-2.5 text-gray-400 font-medium">商品名</th>
                <th class="text-left px-4 py-2.5 text-gray-400 font-medium">現在</th>
                <th class="text-left px-4 py-2.5 text-gray-400 font-medium">改定後</th>
                <th class="text-left px-4 py-2.5 text-gray-400 font-medium">差額</th>
                <th class="text-left px-4 py-2.5 text-gray-400 font-medium">改定日</th>
                <th class="text-left px-4 py-2.5 text-gray-400 font-medium">連携先</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <template x-for="p in priceItems" :key="p.id">
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-2.5 font-medium text-gray-800" x-text="p.name"></td>
                  <td class="px-4 py-2.5 text-gray-500" x-text="'¥'+p.cur.toLocaleString()"></td>
                  <td class="px-4 py-2.5 font-bold text-gray-800" x-text="'¥'+p.nxt.toLocaleString()"></td>
                  <td class="px-4 py-2.5 font-semibold" :class="p.nxt>p.cur?'text-red-500':'text-green-600'" x-text="(p.nxt>p.cur?'+':'')+'¥'+(p.nxt-p.cur).toLocaleString()"></td>
                  <td class="px-4 py-2.5 text-gray-500" x-text="p.date"></td>
                  <td class="px-4 py-2.5">
                    <div class="flex gap-1 flex-wrap">
                      <template x-for="ch in p.chs" :key="ch">
                        <span class="px-1.5 py-0.5 rounded text-xs" :class="p.auto.includes(ch)?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'" x-text="ch"></span>
                      </template>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- CSV一括出力セクション（手動CSVチャネル向け） -->
        <div class="bg-white rounded-xl border border-amber-100 shadow-sm mt-4 overflow-hidden">
          <div class="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
            <i class="fas fa-file-export text-amber-500 text-sm"></i>
            <h3 class="font-semibold text-amber-800 text-sm">価格CSV出力 <span class="text-xs font-normal text-amber-600 ml-1">（手動連携チャネル）</span></h3>
          </div>
          <div class="p-4">
            <p class="text-xs text-gray-500 mb-4">以下のチャネルは価格連携が「手動(CSV)」です。改定前にCSVを出力・アップロードしてください。</p>
            <div class="grid grid-cols-3 gap-3">
              <!-- ZOZOTOWN -->
              <div class="border border-gray-100 rounded-xl p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base">👗</div>
                  <div>
                    <div class="font-semibold text-gray-800 text-xs">ZOZOTOWN</div>
                    <div class="text-xs text-amber-600">手動(CSV)</div>
                  </div>
                </div>
                <div class="text-xs text-gray-400 mb-1">対象改定件数</div>
                <div class="text-lg font-bold text-gray-800 mb-3">2 <span class="text-xs font-normal text-gray-400">件</span></div>
                <div class="space-y-1.5">
                  <button @click="exportPriceCsv('ZOZOTOWN')" class="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600 transition-colors font-medium">
                    <i class="fas fa-download"></i> CSV出力
                  </button>
                  <button @click="notify('ZOZOTOWNのアップロードページを開きました','info')" class="w-full flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                    <i class="fas fa-upload text-xs"></i> アップロード手順
                  </button>
                </div>
              </div>

              <!-- マルイウェブチャネル -->
              <div class="border border-gray-100 rounded-xl p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base">🏬</div>
                  <div>
                    <div class="font-semibold text-gray-800 text-xs">マルイウェブチャネル</div>
                    <div class="text-xs text-amber-600">手動(CSV)</div>
                  </div>
                </div>
                <div class="text-xs text-gray-400 mb-1">対象改定件数</div>
                <div class="text-lg font-bold text-gray-800 mb-3">2 <span class="text-xs font-normal text-gray-400">件</span></div>
                <div class="space-y-1.5">
                  <button @click="exportPriceCsv('マルイウェブチャネル')" class="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600 transition-colors font-medium">
                    <i class="fas fa-download"></i> CSV出力
                  </button>
                  <button @click="notify('マルイウェブチャネルのアップロードページを開きました','info')" class="w-full flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                    <i class="fas fa-upload text-xs"></i> アップロード手順
                  </button>
                </div>
              </div>

              <!-- BLOOM ONLINE STORE -->
              <div class="border border-gray-100 rounded-xl p-4 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-base">🌸</div>
                  <div>
                    <div class="font-semibold text-gray-800 text-xs">BLOOM ONLINE STORE</div>
                    <div class="text-xs text-amber-600">手動(CSV) / PVS</div>
                  </div>
                </div>
                <div class="text-xs text-gray-400 mb-1">対象改定件数</div>
                <div class="text-lg font-bold text-gray-800 mb-3">— <span class="text-xs font-normal text-gray-400">件</span></div>
                <div class="space-y-1.5">
                  <button @click="exportPriceCsv('BLOOM ONLINE STORE')" class="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600 transition-colors font-medium">
                    <i class="fas fa-download"></i> CSV出力
                  </button>
                  <button @click="notify('BLOOM ONLINE STOREのアップロードページを開きました','info')" class="w-full flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors">
                    <i class="fas fa-upload text-xs"></i> アップロード手順
                  </button>
                </div>
              </div>
            </div>

            <!-- 一括出力ボタン -->
            <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div class="text-xs text-gray-400 flex items-center gap-1.5">
                <i class="fas fa-info-circle"></i>
                <span>ZOZOTOWNはAPIによる出荷連携必須のためCSV手動、マルイ・BLOOMはAPI未対応</span>
              </div>
              <button @click="exportAllPriceCsv()" class="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-800 transition-colors font-medium">
                <i class="fas fa-file-archive"></i> 3チャネル一括CSV出力
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend / Channel map -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 text-sm mb-4">チャネル別 連携方式</h3>
        <div class="space-y-2.5 text-xs">
          <div class="text-gray-400 font-medium uppercase tracking-wide mb-1">API 自動連携</div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span><span class="text-gray-700">楽天市場</span><span class="ml-auto text-gray-400">テキスト・画像・価格</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span><span class="text-gray-700">Amazon</span><span class="ml-auto text-gray-400">テキスト・価格</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span><span class="text-gray-700">TSUNAGU</span><span class="ml-auto text-gray-400">テキスト・画像・価格</span></div>
          <div class="border-t border-gray-100 my-2"></div>
          <div class="text-gray-400 font-medium uppercase tracking-wide mb-1">価格のみ自動 (CSV手動)</div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span><span class="text-gray-700">ZOZOTOWN</span><button @click="exportPriceCsv('ZOZOTOWN')" class="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"><i class="fas fa-download text-xs"></i>CSV</button></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span><span class="text-gray-700">マルイウェブ</span><button @click="exportPriceCsv('マルイウェブチャネル')" class="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"><i class="fas fa-download text-xs"></i>CSV</button></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span><span class="text-gray-700">Shopify (NKS)</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span><span class="text-gray-700">Shopify (Zsys)</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span><span class="text-gray-700">BLOOM (PVS)</span><button @click="exportPriceCsv('BLOOM ONLINE STORE')" class="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"><i class="fas fa-download text-xs"></i>CSV</button></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================================================================
       PAGE: CHANNELS
  ================================================================ -->
  <section x-show="page==='channels'" class="p-6 flex-1">
    <div class="mb-5">
      <h1 class="text-xl font-bold text-gray-800">EC チャネル連携設定</h1>
      <p class="text-sm text-gray-500 mt-0.5">連携先モールの管理・設定</p>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <template x-for="ch in channels" :key="ch.id">
        <div class="channel-card bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="ch.bg"><span x-text="ch.icon"></span></div>
              <div>
                <div class="font-semibold text-gray-800 text-sm" x-text="ch.name"></div>
                <div class="text-xs text-gray-400" x-text="ch.type"></div>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" :checked="ch.on" class="sr-only peer">
              <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <div class="space-y-1.5 text-xs mb-3">
            <div class="flex justify-between"><span class="text-gray-400">テキスト連携</span><span :class="ch.txt==='自動'?'text-green-600':ch.txt==='手動CSV'?'text-amber-600':'text-gray-300'" x-text="ch.txt"></span></div>
            <div class="flex justify-between"><span class="text-gray-400">画像連携</span><span :class="ch.img==='自動'?'text-green-600':ch.img==='手動CSV'?'text-amber-600':'text-gray-300'" x-text="ch.img"></span></div>
            <div class="flex justify-between"><span class="text-gray-400">価格連携</span><span :class="ch.prc==='自動'?'text-green-600':ch.prc==='確認中'?'text-amber-600':'text-gray-300'" x-text="ch.prc"></span></div>
            <div class="flex justify-between"><span class="text-gray-400">最終同期</span><span class="text-gray-400" x-text="ch.last"></span></div>
          </div>
          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="sync-dot" :class="ch.st==='ok'?'ok':ch.st==='warn'?'warn':'err'"></span>
              <span :class="ch.st==='ok'?'text-green-600':ch.st==='warn'?'text-amber-600':'text-red-600'" x-text="ch.stTxt"></span>
            </div>
            <button @click="notify('設定画面を開きました','info')" class="text-xs text-slate-500 hover:underline">設定</button>
          </div>
        </div>
      </template>
    </div>
  </section>

  <!-- ================================================================
       PAGE: EXPORT (フォーマットDL)
  ================================================================ -->
  <section x-show="page==='export'" class="p-6 flex-1">
    <div class="mb-5">
      <h1 class="text-xl font-bold text-gray-800">任意フォーマット DL</h1>
      <p class="text-sm text-gray-500 mt-0.5">各モール用CSVをマスタ情報から生成・出力</p>
    </div>
    <div class="grid grid-cols-3 gap-4 mb-6">
      <template x-for="fmt in exportFmts" :key="fmt.id">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-slate-300 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <i class="fas fa-file-csv text-slate-500 text-lg"></i>
            </div>
            <span :class="fmt.ready?'bg-green-50 text-green-600':'bg-amber-50 text-amber-600'" class="text-xs px-2 py-0.5 rounded-full" x-text="fmt.ready?'準備完了':'確認中'"></span>
          </div>
          <div class="font-semibold text-gray-800 text-sm mb-1" x-text="fmt.name"></div>
          <div class="text-xs text-gray-500 mb-3" x-text="fmt.desc"></div>
          <div class="text-xs text-gray-400 mb-3">最終出力: <span x-text="fmt.last"></span></div>
          <button @click="notify(fmt.name + ' のCSVを生成しました','success')" class="w-full py-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-700 flex items-center justify-center gap-1.5">
            <i class="fas fa-download"></i> ダウンロード
          </button>
        </div>
      </template>
    </div>

    <!-- Custom format builder -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 class="font-semibold text-gray-700 text-sm mb-4">カスタムフォーマット作成</h3>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">フォーマット名</label>
          <input type="text" placeholder="例：ZOZO夏フェア用" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">対象モール</label>
          <select class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white">
            <option>ZOZOTOWN</option><option>マルイウェブチャネル</option><option>Shopify (NKS)</option><option>Shopify (Zsys)</option><option>BLOOM</option>
          </select>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-xs text-gray-500 mb-2">出力項目を選択</label>
        <div class="flex flex-wrap gap-2">
          <template x-for="f in csvFields" :key="f">
            <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" class="rounded" checked> <span x-text="f"></span>
            </label>
          </template>
        </div>
      </div>
      <button @click="notify('カスタムフォーマットを保存しました','success')" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">フォーマットを保存</button>
    </div>
  </section>

  <!-- ================================================================
       PAGE: BOX (No.5)
  ================================================================ -->
  <section x-show="page==='box'" class="p-6 flex-1">
    <div class="flex items-center justify-between mb-5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="scope-badge-blue text-xs">No.5</span>
          <h1 class="text-xl font-bold text-gray-800">BOXからの画像取込</h1>
        </div>
        <p class="text-sm text-gray-500">BOXから画像の取込・商品への自動紐づけ</p>
      </div>
      <button @click="notify('BOXから最新画像を同期中...','info')" class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
        <i class="fas fa-sync text-xs"></i> 今すぐ同期
      </button>
    </div>

    <!-- Status -->
    <div class="grid grid-cols-4 gap-3 mb-5">
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">BOX接続</div>
        <div class="flex items-center gap-1.5"><span class="sync-dot ok"></span><span class="font-semibold text-green-600 text-sm">認証済み</span></div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">本日取込</div>
        <div class="text-2xl font-bold text-gray-800">156</div>
        <div class="text-xs text-gray-400 mt-1">枚</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">命名規則認識成功</div>
        <div class="text-2xl font-bold text-green-600">143</div>
        <div class="text-xs text-gray-400 mt-1">/ 156枚</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div class="text-xs text-gray-500 mb-1">認識不可</div>
        <div class="text-2xl font-bold text-amber-500">13</div>
        <div class="text-xs text-gray-400 mt-1">命名規則外</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-5 mb-5">
      <!-- Connection settings -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-plug text-slate-400"></i> 接続・フォルダ設定
        </h3>
        <div class="space-y-2.5 text-sm">
          <div class="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span class="text-gray-600 text-xs">BOXアカウント</span>
            <span class="text-gray-700 text-xs">nakashi-jewelry@box.com</span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span class="text-gray-600 text-xs">監視フォルダ</span>
            <span class="font-mono text-gray-700 text-xs">/商品画像/撮影済み/</span>
          </div>
          <div class="flex items-center justify-between py-2.5 border-b border-gray-100">
            <span class="text-gray-600 text-xs">取込間隔</span>
            <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">毎日 08:00</span>
          </div>
          <div class="flex items-center justify-between py-2.5">
            <span class="text-gray-600 text-xs">対象拡張子</span>
            <span class="text-gray-700 text-xs">.jpg / .jpeg / .png / .tif</span>
          </div>
        </div>
      </div>

      <!-- Naming rule -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-tag text-slate-400"></i> 命名規則設定
        </h3>
        <div class="text-xs text-gray-500 mb-3">BOXのファイル名から商品コードを抽出するルール</div>
        <div class="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700 mb-3">
          <div class="text-gray-400 mb-1">パターン例：</div>
          <div class="text-blue-600">{商品コード}</div>
          <div class="text-gray-500">_ <span class="text-purple-600">{色コード}</span> _ <span class="text-amber-500">{連番}</span>.jpg</div>
          <div class="mt-2 text-gray-600">EST-RG001_WG_01.jpg → <span class="text-green-600">EST-RG001</span> として取込</div>
        </div>
        <div class="space-y-2 text-xs mb-3">
          <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="rule" checked class="accent-slate-700"> 商品コード＋色コード（推奨）</label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="rule" class="accent-slate-700"> 商品コードのみ</label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="rule" class="accent-slate-700"> カスタムパターン</label>
        </div>
        <div class="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-700 flex items-start gap-1.5">
          <i class="fas fa-exclamation-triangle mt-0.5 flex-shrink-0"></i>
          命名規則は要件定義 第6回（BOX連携仕様確認）にて確定予定
        </div>
      </div>
    </div>

    <!-- Recent imports -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-700 text-sm">直近の取込ログ</h3>
        <button @click="page='images'" class="text-xs text-slate-600 hover:underline flex items-center gap-1"><i class="fas fa-images"></i> 画像管理で確認</button>
      </div>
      <table class="w-full text-xs">
        <thead class="bg-gray-50"><tr>
          <th class="text-left px-4 py-2.5 text-gray-400 font-medium">ファイル名</th>
          <th class="text-left px-4 py-2.5 text-gray-400 font-medium">認識商品コード</th>
          <th class="text-left px-4 py-2.5 text-gray-400 font-medium">種別</th>
          <th class="text-left px-4 py-2.5 text-gray-400 font-medium">取込日時</th>
          <th class="text-left px-4 py-2.5 text-gray-400 font-medium">結果</th>
        </tr></thead>
        <tbody class="divide-y divide-gray-50">
          <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">EST-RG001_WG_01.jpg</td><td class="px-4 py-2 text-blue-600">EST-RG001</td><td class="px-4 py-2 text-gray-500">本画像</td><td class="px-4 py-2 text-gray-400">06/02 08:01</td><td class="px-4 py-2"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">取込成功</span></td></tr>
          <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">EST-NK002_PL_01.jpg</td><td class="px-4 py-2 text-blue-600">EST-NK002</td><td class="px-4 py-2 text-gray-500">本画像</td><td class="px-4 py-2 text-gray-400">06/02 08:01</td><td class="px-4 py-2"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">取込成功</span></td></tr>
          <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">IMG_20260601_1024.jpg</td><td class="px-4 py-2 text-red-400">—</td><td class="px-4 py-2 text-gray-500">—</td><td class="px-4 py-2 text-gray-400">06/02 08:01</td><td class="px-4 py-2"><span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">認識不可</span></td></tr>
          <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">EST-EA003_YG_02.jpg</td><td class="px-4 py-2 text-blue-600">EST-EA003</td><td class="px-4 py-2 text-gray-500">着用画像</td><td class="px-4 py-2 text-gray-400">06/02 08:01</td><td class="px-4 py-2"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">取込成功</span></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ================================================================
       PAGE: DATA LINK（データ連携）
  ================================================================ -->
  <section x-show="page==='datalink'" class="p-6 flex-1">

    <!-- ===== TOP: データ連携トップ ===== -->
    <div x-show="datalinkPage==='top'">
      <div class="mb-6">
        <h1 class="text-xl font-bold text-gray-800">データ連携</h1>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div @click="datalinkPage='connectors'; connectorTab='my'" class="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <i class="fas fa-plug text-blue-500"></i>
            </div>
            <h3 class="font-semibold text-gray-800">コネクタ</h3>
          </div>
          <p class="text-sm text-gray-500">データ連携に利用するコネクタを管理します。</p>
        </div>
        <div @click="datalinkPage='schedule'" class="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <i class="fas fa-calendar-check text-green-500"></i>
            </div>
            <h3 class="font-semibold text-gray-800">連携予約状況</h3>
          </div>
          <p class="text-sm text-gray-500">データ連携の予約状況を管理できます。</p>
        </div>
        <div @click="datalinkPage='history'" class="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <i class="fas fa-history text-amber-500"></i>
            </div>
            <h3 class="font-semibold text-gray-800">連携履歴</h3>
          </div>
          <p class="text-sm text-gray-500">データ連携の履歴を閲覧できます。</p>
        </div>
      </div>
    </div>

    <!-- ===== CONNECTORS: マイコネクタ一覧 ===== -->
    <div x-show="datalinkPage==='connectors'">
      <div class="flex items-center gap-2 mb-5">
        <button @click="datalinkPage='top'" class="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          <i class="fas fa-arrow-left text-xs"></i>
        </button>
        <h1 class="text-xl font-bold text-gray-800">コネクタ</h1>
      </div>

      <!-- Tabs -->
      <div class="flex gap-0 mb-5 border-b border-gray-200">
        <button @click="connectorTab='my'" :class="connectorTab==='my'?'border-b-2 border-blue-500 text-blue-600 font-medium':'text-gray-500 hover:text-gray-700'" class="px-5 py-2.5 text-sm transition-colors">マイコネクタ</button>
        <button @click="connectorTab='search'" :class="connectorTab==='search'?'border-b-2 border-blue-500 text-blue-600 font-medium':'text-gray-500 hover:text-gray-700'" class="px-5 py-2.5 text-sm transition-colors">コネクタを探す</button>
      </div>

      <!-- マイコネクタ タブ -->
      <div x-show="connectorTab==='my'">
        <div class="flex items-center gap-3 mb-5">
          <select class="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none bg-white text-gray-600">
            <option>コネクタ名の昇順</option>
            <option>コネクタ名の降順</option>
            <option>作成日の新しい順</option>
          </select>
          <button @click="notify('コネクタを追加しました','success')" class="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <i class="fas fa-plus text-xs"></i> コネクタを追加
          </button>
        </div>

        <!-- Connector Cards Grid -->
        <div class="grid grid-cols-3 gap-4">
          <template x-for="conn in myConnectors" :key="conn.id">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
              <!-- Card Header -->
              <div class="p-4 border-b border-gray-100">
                <div class="flex items-center justify-between mb-1">
                  <div>
                    <div class="font-bold text-sm" :class="conn.brand==='rakuten'?'text-red-600':'text-blue-700'" x-text="conn.brandLabel"></div>
                    <div class="text-xs text-gray-500" x-text="conn.typeName"></div>
                  </div>
                  <div class="w-8 h-8 rounded-md flex items-center justify-center" :class="conn.brand==='rakuten'?'bg-red-50':'bg-blue-50'">
                    <i class="text-sm" :class="conn.brand==='rakuten'?'fas fa-shopping-cart text-red-500':'fas fa-store text-blue-500'"></i>
                  </div>
                </div>
              </div>
              <!-- Card Body -->
              <div class="p-4 space-y-1.5 text-xs">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="text-gray-400" x-text="conn.urlLabel"></div>
                    <div class="text-gray-700 font-medium truncate" x-text="conn.shopUrl"></div>
                  </div>
                  <button @click="notify('接続情報を編集します','info')" class="ml-2 text-gray-300 hover:text-gray-500 flex-shrink-0">
                    <i class="fas fa-pencil-alt text-xs"></i>
                  </button>
                </div>
                <div>
                  <div class="text-gray-400">店舗名</div>
                  <div class="text-gray-700 font-medium" x-text="conn.shopName"></div>
                </div>
              </div>
              <!-- Card Actions -->
              <div class="px-4 pb-4 space-y-2">
                <button @click="notify('接続情報の設定を開きました','info')" class="w-full py-2 text-xs border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  接続情報の設定
                </button>
                <button @click="openJobManager(conn)" class="w-full py-2 text-xs border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  ジョブの管理
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- コネクタを探す タブ -->
      <div x-show="connectorTab==='search'">
        <div class="relative mb-5">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input type="text" placeholder="コネクタ名で検索..." class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400">
        </div>
        <div class="grid grid-cols-4 gap-4">
          <template x-for="tmpl in connectorTemplates" :key="tmpl.id">
            <div class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div class="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" :class="tmpl.iconBg">
                <i :class="tmpl.icon + ' text-lg'"></i>
              </div>
              <div class="font-semibold text-gray-800 text-sm mb-1" x-text="tmpl.name"></div>
              <div class="text-xs text-gray-500 mb-3" x-text="tmpl.desc"></div>
              <button @click="notify(tmpl.name + ' のコネクタを追加しました','success')" class="w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                追加する
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ===== JOB MANAGER: ジョブ管理 ===== -->
    <div x-show="datalinkPage==='jobs'">
      <div class="flex items-center gap-2 mb-5">
        <button @click="datalinkPage='connectors'; connectorTab='my'" class="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1">
          <i class="fas fa-arrow-left text-xs"></i>
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-800" x-text="selectedConnector ? selectedConnector.brandLabel + ' — ジョブ管理' : 'ジョブ管理'"></h1>
          <div class="text-xs text-gray-500 mt-0.5" x-text="selectedConnector ? selectedConnector.shopName : ''"></div>
        </div>
        <button @click="notify('ジョブを追加しました','success')" class="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <i class="fas fa-plus text-xs"></i> ジョブを追加
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <template x-for="job in connectorJobs" :key="job.id">
          <div class="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="font-semibold text-gray-800 text-sm" x-text="job.name"></div>
                <div class="text-xs text-gray-500 mt-0.5" x-text="job.method"></div>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-full" :class="job.active?'bg-green-50 text-green-600':'bg-gray-100 text-gray-400'" x-text="job.active?'有効':'無効'"></span>
            </div>
            <div class="text-xs text-gray-500 space-y-1 mb-4">
              <div class="flex justify-between"><span class="text-gray-400">スケジュール</span><span x-text="job.schedule"></span></div>
              <div class="flex justify-between"><span class="text-gray-400">最終実行</span><span x-text="job.lastRun"></span></div>
              <div class="flex justify-between"><span class="text-gray-400">結果</span>
                <span :class="job.lastStatus==='成功'?'text-green-600':'text-amber-600'" x-text="job.lastStatus"></span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="openMapping(job)" class="flex-1 py-2 text-xs border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">
                <i class="fas fa-code-branch mr-1"></i> マッピング設定
              </button>
              <button @click="notify(job.name + ' を実行しました','success')" class="flex-1 py-2 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                <i class="fas fa-play mr-1 text-xs"></i> 今すぐ実行
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ===== MAPPING: データマッピング設定 ===== -->
    <div x-show="datalinkPage==='mapping'">
      <div class="flex items-center gap-2 mb-5">
        <button @click="datalinkPage='jobs'" class="text-gray-400 hover:text-gray-600 flex items-center gap-1.5 text-sm">
          <i class="fas fa-arrow-left text-xs"></i> <span>戻る</span>
        </button>
        <h1 class="text-xl font-bold text-gray-800 ml-2">データマッピング設定</h1>
      </div>

      <!-- Job info header -->
      <div x-show="selectedJob" class="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="selectedConnector && selectedConnector.brand==='rakuten'?'bg-red-50':'bg-blue-50'">
          <i :class="selectedConnector && selectedConnector.brand==='rakuten'?'fas fa-shopping-cart text-red-500':'fas fa-store text-blue-500'"></i>
        </div>
        <div class="flex-1">
          <div class="font-bold text-sm" :class="selectedConnector && selectedConnector.brand==='rakuten'?'text-red-600':'text-blue-700'"
            x-text="selectedConnector ? selectedConnector.brandLabel : ''"></div>
          <div class="text-xs text-gray-500 mt-0.5">
            ジョブ名 <span class="font-medium text-gray-700" x-text="selectedJob ? selectedJob.name : ''"></span>
          </div>
        </div>
        <div class="text-right text-xs text-gray-500">
          <div>連携方法</div>
          <div class="font-medium text-gray-700" x-text="selectedJob ? selectedJob.method : ''"></div>
        </div>
      </div>

      <!-- Mapping area -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <!-- Column headers -->
        <div class="grid grid-cols-[1fr_40px_1fr] gap-4 mb-4">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">FROM EBISU PIM</div>
          <div></div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
            x-text="'TO ' + (selectedConnector ? selectedConnector.brandLabel : '')"></div>
        </div>

        <!-- Mapping rows -->
        <div class="space-y-3">
          <template x-for="(row, idx) in mappingRows" :key="idx">
            <div class="grid grid-cols-[1fr_40px_1fr] gap-4 items-start">
              <!-- FROM side -->
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">項目</span>
                  <select x-model="row.from" class="flex-1 border border-blue-200 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-gray-700">
                    <option value="">-- 項目を選択 --</option>
                    <template x-for="f in pimFields" :key="f.value">
                      <option :value="f.value" x-text="f.label"></option>
                    </template>
                  </select>
                </div>
                <button @click="row.transforms.push({type:''})" class="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  <i class="fas fa-plus text-xs"></i> データ変換を追加
                </button>
                <div x-show="row.transforms.length > 0" class="mt-2 space-y-1">
                  <template x-for="(tr, ti) in row.transforms" :key="ti">
                    <div class="flex items-center gap-1">
                      <select x-model="tr.type" class="flex-1 border border-blue-200 rounded text-xs px-2 py-1 focus:outline-none bg-white text-gray-600">
                        <option value="">変換タイプを選択</option>
                        <option value="prefix">プレフィックス追加</option>
                        <option value="suffix">サフィックス追加</option>
                        <option value="replace">文字置換</option>
                        <option value="trim">空白除去</option>
                        <option value="upper">大文字変換</option>
                      </select>
                      <button @click="row.transforms.splice(ti,1)" class="text-red-300 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button>
                    </div>
                  </template>
                </div>
              </div>
              <!-- Arrow -->
              <div class="flex items-center justify-center pt-5">
                <i class="fas fa-arrow-right text-gray-400 text-lg"></i>
              </div>
              <!-- TO side -->
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-0.5 rounded">項目</span>
                  <span class="text-sm font-medium text-gray-700" x-text="row.to"></span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Add row button -->
        <button @click="addMappingRow()" class="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
          <i class="fas fa-plus text-xs"></i> データマッピング行を追加
        </button>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex justify-end gap-2">
        <button @click="datalinkPage='jobs'" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
        <button @click="notify('マッピング設定を保存しました','success')" class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
          <i class="fas fa-save text-xs"></i> 保存する
        </button>
      </div>
    </div>

    <!-- ===== SCHEDULE: 連携予約状況 ===== -->
    <div x-show="datalinkPage==='schedule'">
      <div class="flex items-center gap-2 mb-5">
        <button @click="datalinkPage='top'" class="text-gray-400 hover:text-gray-600 text-sm"><i class="fas fa-arrow-left text-xs"></i></button>
        <h1 class="text-xl font-bold text-gray-800">連携予約状況</h1>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">コネクタ</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">ジョブ名</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">予約日時</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">ステータス</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-xs">
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（rakuten_honda）</td><td class="px-4 py-3 text-gray-700">商品データ更新用定期実行ジョブ</td><td class="px-4 py-3 text-gray-600">2026/07/06 03:00</td><td class="px-4 py-3"><span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">予約済</span></td><td class="px-4 py-3"><button @click="notify('予約をキャンセルしました','info')" class="text-xs text-gray-400 hover:text-red-500">キャンセル</button></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（テスト0710）</td><td class="px-4 py-3 text-gray-700">商品データ更新用定期実行ジョブ</td><td class="px-4 py-3 text-gray-600">2026/07/06 03:00</td><td class="px-4 py-3"><span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">予約済</span></td><td class="px-4 py-3"><button @click="notify('予約をキャンセルしました','info')" class="text-xs text-gray-400 hover:text-red-500">キャンセル</button></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-blue-700 font-medium">EBISUMART（TSUNAGU）</td><td class="px-4 py-3 text-gray-700">在庫・価格同期ジョブ</td><td class="px-4 py-3 text-gray-600">2026/07/06 06:00</td><td class="px-4 py-3"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">実行中</span></td><td class="px-4 py-3"><button class="text-xs text-gray-300 cursor-not-allowed">キャンセル</button></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（20260224）</td><td class="px-4 py-3 text-gray-700">画像アップロードジョブ</td><td class="px-4 py-3 text-gray-600">2026/07/07 00:00</td><td class="px-4 py-3"><span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">予約済</span></td><td class="px-4 py-3"><button @click="notify('予約をキャンセルしました','info')" class="text-xs text-gray-400 hover:text-red-500">キャンセル</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ===== HISTORY: 連携履歴 ===== -->
    <div x-show="datalinkPage==='history'">
      <div class="flex items-center gap-2 mb-5">
        <button @click="datalinkPage='top'" class="text-gray-400 hover:text-gray-600 text-sm"><i class="fas fa-arrow-left text-xs"></i></button>
        <h1 class="text-xl font-bold text-gray-800">連携履歴</h1>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">実行日時</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">コネクタ</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">ジョブ名</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">件数</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">結果</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-xs">
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-gray-600">2026/07/05 03:01</td><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（rakuten_honda）</td><td class="px-4 py-3 text-gray-700">商品データ更新用定期実行ジョブ</td><td class="px-4 py-3 text-gray-600">312件</td><td class="px-4 py-3"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-gray-600">2026/07/05 03:01</td><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（テスト0710）</td><td class="px-4 py-3 text-gray-700">商品データ更新用定期実行ジョブ</td><td class="px-4 py-3 text-gray-600">87件</td><td class="px-4 py-3"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-gray-600">2026/07/04 06:00</td><td class="px-4 py-3 text-blue-700 font-medium">EBISUMART（TSUNAGU）</td><td class="px-4 py-3 text-gray-700">在庫・価格同期ジョブ</td><td class="px-4 py-3 text-gray-600">1,284件</td><td class="px-4 py-3"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-gray-600">2026/07/04 03:01</td><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（20260224）</td><td class="px-4 py-3 text-gray-700">画像アップロードジョブ</td><td class="px-4 py-3 text-gray-600">23件</td><td class="px-4 py-3"><span class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">一部エラー</span></td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-gray-600">2026/07/03 03:01</td><td class="px-4 py-3 text-red-600 font-medium">楽天RMS（rakuten_honda）</td><td class="px-4 py-3 text-gray-700">商品データ更新用定期実行ジョブ</td><td class="px-4 py-3 text-gray-600">298件</td><td class="px-4 py-3"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">成功</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </section>

  <!-- ================================================================
       PAGE: SALE（セール履歴管理）
  ================================================================ -->
  <section x-show="page==='sale'" class="p-6 flex-1">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">セール履歴管理</h1>
        <p class="text-sm text-gray-500 mt-0.5">セール情報の一括登録・履歴マスタ管理・モール連携</p>
      </div>
      <div class="flex gap-2">
        <button @click="saleTab='list'" :class="saleTab==='list'?'bg-slate-800 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
          <i class="fas fa-list text-xs"></i> 履歴一覧
        </button>
        <button @click="saleTab='upload'" :class="saleTab==='upload'?'bg-slate-800 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
          <i class="fas fa-file-upload text-xs"></i> CSV一括登録
        </button>

      </div>
    </div>

    <!-- ===== TAB: 履歴一覧 ===== -->
    <div x-show="saleTab==='list'">
      <!-- Stats -->
      <div class="grid grid-cols-4 gap-3 mb-5">
        <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-gray-800">12</div>
          <div class="text-xs text-gray-500 mt-1">総セール数</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-green-600">3</div>
          <div class="text-xs text-gray-500 mt-1">開催中</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-blue-600">2</div>
          <div class="text-xs text-gray-500 mt-1">予定</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div class="text-2xl font-bold text-gray-400">7</div>
          <div class="text-xs text-gray-500 mt-1">終了済み</div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-4 flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 min-w-40">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
          <input type="text" placeholder="セール名・管理番号・商品コードで検索..." x-model="saleSearch" class="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-slate-400">
        </div>
        <input type="date" class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white text-gray-500">
        <span class="text-xs text-gray-300">〜</span>
        <input type="date" class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white text-gray-500">
        <select class="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none bg-white">
          <option>チャネル：すべて</option>
          <option>楽天市場</option><option>Amazon</option><option>ZOZOTOWN</option><option>マルイウェブ</option><option>Shopify</option>
        </select>

        <button @click="saleSearch=''" class="text-xs text-gray-400 hover:text-gray-600 px-2">クリア</button>
      </div>

      <!-- List table -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">管理番号</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">セール名</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">セール期間</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">コネクタ</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">対象商品数</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium text-xs">登録日</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <template x-for="s in filteredSales()" :key="s.id">
              <tr class="hover:bg-gray-50 cursor-pointer" @click="openSaleDetail(s)">
                <td class="px-4 py-3 font-mono text-xs text-gray-500" x-text="s.no"></td>
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-800 text-sm" x-text="s.name"></div>
                  <div class="text-xs text-gray-400" x-text="s.memo"></div>
                </td>
                <td class="px-4 py-3 text-xs text-gray-600">
                  <div x-text="s.start"></div>
                  <div class="text-gray-400">〜 <span x-text="s.end"></span></div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1 flex-wrap">
                    <template x-for="ch in s.channels" :key="ch">
                      <span class="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded" x-text="ch"></span>
                    </template>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded" x-text="s.itemCount + '件'"></span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500" x-text="s.createdAt"></td>
                <td class="px-4 py-3">
                  <button class="text-gray-300 hover:text-gray-500 text-xs"><i class="fas fa-chevron-right"></i></button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span x-text="filteredSales().length + '件 表示'"></span>
          <div class="flex gap-1">
            <button class="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50">前へ</button>
            <button class="px-2.5 py-1 rounded bg-slate-800 text-white">1</button>
            <button class="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50">次へ</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== TAB: CSV一括登録 ===== -->
    <div x-show="saleTab==='upload'">
      <!-- 注意バナー -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5 flex-shrink-0"></i>
        <div class="text-sm text-amber-700">
          <strong>価格変更 20% 超はエラー：</strong>アップロード時、現在価格から20%以上変更されている行はエラーとして登録・更新されません。CSVアップロード前にご確認ください。
        </div>
      </div>

      <div class="grid grid-cols-2 gap-5 mb-5">
        <!-- Upload area -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <i class="fas fa-file-csv text-slate-400"></i> CSVファイルのアップロード
          </h3>
          <!-- セール基本情報 -->
          <div class="space-y-3 mb-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">セール名 <span class="text-red-400">*</span></label>
              <input type="text" placeholder="例：2026夏ジュエリーセール" x-model="csvSaleName" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">セール開始日 <span class="text-red-400">*</span></label>
                <input type="date" x-model="csvSaleStart" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">セール終了日 <span class="text-red-400">*</span></label>
                <input type="date" x-model="csvSaleEnd" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
              </div>
            </div>
          </div>
          <!-- Drop zone -->
          <div
            class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-gray-50 transition-all"
            @click="triggerCsvUpload()"
            :class="csvUploaded?'border-green-300 bg-green-50':''"
          >
            <div x-show="!csvUploaded">
              <i class="fas fa-cloud-upload-alt text-3xl text-gray-300 mb-2"></i>
              <div class="text-sm text-gray-500 mb-1">CSVファイルをドラッグ&ドロップ</div>
              <div class="text-xs text-gray-400">または クリックして選択</div>
            </div>
            <div x-show="csvUploaded">
              <i class="fas fa-check-circle text-3xl text-green-400 mb-2"></i>
              <div class="text-sm text-green-600 font-medium">sale_summer2026.csv</div>
              <div class="text-xs text-green-500 mt-1">52行 読み込み完了</div>
            </div>
          </div>
          <button
            @click="runCsvUpload()"
            :disabled="!csvUploaded || !csvSaleName"
            class="mt-4 w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <i class="fas fa-upload text-xs"></i> アップロードして登録
          </button>
        </div>

        <!-- CSV format guide -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <i class="fas fa-table text-slate-400"></i> CSV フォーマット仕様
          </h3>
          <div class="overflow-x-auto mb-4">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-slate-800 text-white">
                  <th class="px-3 py-2 text-left font-medium">カラム名</th>
                  <th class="px-3 py-2 text-left font-medium">必須</th>
                  <th class="px-3 py-2 text-left font-medium">説明</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr class="bg-white"><td class="px-3 py-2 font-mono text-gray-700">管理番号</td><td class="px-3 py-2 text-red-500">必須</td><td class="px-3 py-2 text-gray-600">SKU管理番号</td></tr>
                <tr class="bg-gray-50"><td class="px-3 py-2 font-mono text-gray-700">商品コード</td><td class="px-3 py-2 text-red-500">必須</td><td class="px-3 py-2 text-gray-600">PIM商品コード</td></tr>
                <tr class="bg-white"><td class="px-3 py-2 font-mono text-gray-700">コネクタ</td><td class="px-3 py-2 text-red-500">必須</td><td class="px-3 py-2 text-gray-600">楽天/Amazon/ZOZO等</td></tr>
                <tr class="bg-gray-50"><td class="px-3 py-2 font-mono text-gray-700">価格項目名</td><td class="px-3 py-2 text-red-500">必須</td><td class="px-3 py-2 text-gray-600">通常価格/セール価格</td></tr>
                <tr class="bg-white"><td class="px-3 py-2 font-mono text-gray-700">セール価格</td><td class="px-3 py-2 text-red-500">必須</td><td class="px-3 py-2 text-gray-600">税込価格（整数）</td></tr>
              </tbody>
            </table>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 mb-3">
            <div class="text-gray-400 mb-1"># サンプル</div>
            <div>管理番号,商品コード,コネクタ,価格項目名,セール価格</div>
            <div>MGT-001,EST-RG001,楽天市場,セール価格,37800</div>
            <div>MGT-002,EST-RG001,Amazon,セール価格,37800</div>
            <div>MGT-003,EST-NK002,ZOZOTOWN,セール価格,23800</div>
          </div>
          <button @click="notify('サンプルCSVをダウンロードしました','success')" class="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 flex items-center justify-center gap-1.5">
            <i class="fas fa-download"></i> サンプルCSVをダウンロード
          </button>
        </div>
      </div>

      <!-- Upload result (shown after upload) -->
      <div x-show="csvResult" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-gray-700 text-sm">アップロード結果</h3>
          <div class="flex items-center gap-3 text-xs">
            <span class="text-green-600"><i class="fas fa-check mr-1"></i>成功 49件</span>
            <span class="text-red-500"><i class="fas fa-times mr-1"></i>エラー 3件</span>
          </div>
        </div>
        <table class="w-full text-xs">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">管理番号</th>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">商品コード</th>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">チャネル</th>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">セール価格</th>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">変動率</th>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">結果</th>
              <th class="text-left px-4 py-2.5 text-gray-400 font-medium">エラー理由</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">MGT-001</td><td class="px-4 py-2 text-gray-700">EST-RG001</td><td class="px-4 py-2 text-gray-600">楽天市場</td><td class="px-4 py-2 font-semibold text-gray-800">¥37,800</td><td class="px-4 py-2 text-green-600">-10.0%</td><td class="px-4 py-2"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">登録済</span></td><td class="px-4 py-2 text-gray-300">—</td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">MGT-002</td><td class="px-4 py-2 text-gray-700">EST-RG001</td><td class="px-4 py-2 text-gray-600">Amazon</td><td class="px-4 py-2 font-semibold text-gray-800">¥37,800</td><td class="px-4 py-2 text-green-600">-10.0%</td><td class="px-4 py-2"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">登録済</span></td><td class="px-4 py-2 text-gray-300">—</td></tr>
            <tr class="bg-red-50"><td class="px-4 py-2 font-mono text-red-500">MGT-008</td><td class="px-4 py-2 text-gray-700">EST-NK002</td><td class="px-4 py-2 text-gray-600">楽天市場</td><td class="px-4 py-2 font-semibold text-red-600">¥18,000</td><td class="px-4 py-2 text-red-600 font-bold">-35.7%</td><td class="px-4 py-2"><span class="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">エラー</span></td><td class="px-4 py-2 text-red-500">20%超の価格変更</td></tr>
            <tr class="hover:bg-gray-50"><td class="px-4 py-2 font-mono text-gray-600">MGT-009</td><td class="px-4 py-2 text-gray-700">EST-NK002</td><td class="px-4 py-2 text-gray-600">ZOZOTOWN</td><td class="px-4 py-2 font-semibold text-gray-800">¥23,800</td><td class="px-4 py-2 text-green-600">-15.0%</td><td class="px-4 py-2"><span class="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">登録済</span></td><td class="px-4 py-2 text-gray-300">—</td></tr>
            <tr class="bg-red-50"><td class="px-4 py-2 font-mono text-red-500">MGT-015</td><td class="px-4 py-2 text-gray-700">EST-RG005</td><td class="px-4 py-2 text-gray-600">楽天市場</td><td class="px-4 py-2 font-semibold text-red-600">¥60,000</td><td class="px-4 py-2 text-red-600 font-bold">-32.6%</td><td class="px-4 py-2"><span class="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">エラー</span></td><td class="px-4 py-2 text-red-500">20%超の価格変更</td></tr>
          </tbody>
        </table>
        <div class="p-4 border-t border-gray-100 flex items-center gap-3">
          <div class="flex-1 text-xs text-gray-500">※エラー行は修正後に再アップロードが必要です。正常行は「2026夏ジュエリーセール」として保存されました。</div>
          <button @click="saleTab='list'; notify('セール履歴が登録されました','success')" class="px-4 py-2 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700">履歴一覧へ</button>
        </div>
      </div>
    </div>

    <!-- ===== TAB: 新規登録 ===== -->
    <div x-show="saleTab==='new'">
      <div class="grid grid-cols-2 gap-5">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-semibold text-gray-700 text-sm mb-4 flex items-center gap-2">
            <i class="fas fa-edit text-slate-400"></i> セール基本情報
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">セール名 <span class="text-red-400">*</span></label>
              <input type="text" placeholder="例：2026秋冬ブライダルフェア" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">開始日 <span class="text-red-400">*</span></label>
                <input type="date" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">終了日 <span class="text-red-400">*</span></label>
                <input type="date" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400">
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-2">コネクタ/ショップ <span class="text-red-400">*</span></label>
              <div class="flex flex-wrap gap-2">
                <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"><input type="checkbox" class="rounded" checked> 楽天市場</label>
                <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"><input type="checkbox" class="rounded" checked> Amazon</label>
                <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"><input type="checkbox" class="rounded"> ZOZOTOWN</label>
                <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"><input type="checkbox" class="rounded"> マルイウェブ</label>
                <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"><input type="checkbox" class="rounded"> Shopify (NKS)</label>
                <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer hover:bg-gray-50"><input type="checkbox" class="rounded"> BLOOM</label>
              </div>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">備考</label>
              <textarea rows="2" placeholder="セールの説明など..." class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400 resize-none"></textarea>
            </div>
          </div>
        </div>

        <!-- Item list -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <i class="fas fa-boxes text-slate-400"></i> 対象商品/SKU
            </h3>
            <button @click="notify('商品選択ダイアログを開きました','info')" class="text-xs px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-1">
              <i class="fas fa-plus"></i> 商品を追加
            </button>
          </div>
          <div class="overflow-y-auto max-h-72">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="text-left px-3 py-2 text-gray-400 font-medium">商品コード</th>
                  <th class="text-left px-3 py-2 text-gray-400 font-medium">商品名</th>
                  <th class="text-left px-3 py-2 text-gray-400 font-medium">通常価格</th>
                  <th class="text-left px-3 py-2 text-gray-400 font-medium">セール価格</th>
                  <th class="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <template x-for="item in newSaleItems" :key="item.code">
                  <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 font-mono text-gray-500" x-text="item.code"></td>
                    <td class="px-3 py-2 text-gray-700" x-text="item.name"></td>
                    <td class="px-3 py-2 text-gray-500" x-text="'¥'+item.price.toLocaleString()"></td>
                    <td class="px-3 py-2">
                      <input type="number" :value="item.salePrice" class="w-24 border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-slate-400"
                        :class="(item.price - item.salePrice)/item.price > 0.2 ? 'border-red-300 bg-red-50 text-red-600' : ''">
                    </td>
                    <td class="px-3 py-2">
                      <span class="font-medium text-xs"
                        :class="(item.price - item.salePrice)/item.price > 0.2 ? 'text-red-500' : 'text-green-600'"
                        x-text="'-' + Math.round((item.price - item.salePrice)/item.price*100) + '%'"></span>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-center gap-1.5">
            <i class="fas fa-exclamation-triangle flex-shrink-0"></i>
            20%超の価格変更行は赤表示。登録時にエラーとなります。
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button @click="saleTab='list'" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">キャンセル</button>
        <button @click="saleTab='list'; notify('セール履歴マスタを登録しました','success')" class="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2">
          <i class="fas fa-save text-xs"></i> 登録する
        </button>
      </div>
    </div>

  </section>

  <!-- ===== SALE DETAIL MODAL ===== -->
  <div id="saleDetailModal" class="modal-overlay">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
            <i class="fas fa-tags text-pink-400 text-sm"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm" id="modalSaleName">セール詳細</h3>
            <div class="text-xs text-gray-400" id="modalSaleNo"></div>
          </div>
        </div>
        <button onclick="document.getElementById('saleDetailModal').classList.remove('show')" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
      </div>
      <div class="p-5" id="saleDetailContent">
        <!-- JS で描画 -->
      </div>
    </div>
  </div>

</main>

<!-- Notification toast -->
<div id="toast" class="fixed bottom-5 right-5 z-50 hidden">
  <div class="notification bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-64">
    <div id="toast-icon" class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"></div>
    <div id="toast-msg" class="text-sm text-gray-700"></div>
  </div>
</div>

<!-- Price modal -->
<div id="priceModal" class="modal-overlay">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
    <div class="p-5 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-bold text-gray-800">価格改定を登録</h3>
      <button onclick="document.getElementById('priceModal').classList.remove('show')" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
    </div>
    <div class="p-5 space-y-4">
      <div><label class="block text-xs text-gray-500 mb-1">商品コード</label><input type="text" placeholder="EST-RG001" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400"></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-xs text-gray-500 mb-1">現在価格</label><input type="number" placeholder="42000" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400"></div>
        <div><label class="block text-xs text-gray-500 mb-1">改定後価格</label><input type="number" placeholder="46000" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400"></div>
      </div>
      <div><label class="block text-xs text-gray-500 mb-1">改定日</label><input type="date" value="2026-06-15" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400"></div>
      <div>
        <label class="block text-xs text-gray-500 mb-2">連携チャネル</label>
        <div class="flex flex-wrap gap-2">
          <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer bg-green-50 border-green-200"><input type="checkbox" class="rounded" checked> 楽天（自動）</label>
          <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer bg-green-50 border-green-200"><input type="checkbox" class="rounded" checked> Amazon（自動）</label>
          <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer bg-green-50 border-green-200"><input type="checkbox" class="rounded" checked> TSUNAGU（自動）</label>
          <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer"><input type="checkbox" class="rounded" checked> ZOZO</label>
          <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer"><input type="checkbox" class="rounded" checked> マルイ</label>
          <label class="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer"><input type="checkbox" class="rounded"> Shopify (NKS)</label>
        </div>
      </div>
    </div>
    <div class="p-5 border-t border-gray-100 flex gap-2 justify-end">
      <button onclick="document.getElementById('priceModal').classList.remove('show')" class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">キャンセル</button>
      <button onclick="document.getElementById('priceModal').classList.remove('show'); document.querySelector('[x-data]').__x.$data.notify('価格改定を登録しました','success')" class="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700">登録する</button>
    </div>
  </div>
</div>

</div><!-- #app -->

<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
<script>
function openPriceModal() {
  document.getElementById('priceModal').classList.add('show');
}
function pimApp() {
  return {
    page: 'dashboard',
    selectedProduct: null,
    prodSearch: '',
    prodCat: '',
    prodStatus: '',
    priceFilter: '今後',

    // ===== DATA LINK =====
    datalinkPage: 'top',
    connectorTab: 'my',
    selectedConnector: null,
    selectedJob: null,
    mappingRows: [],

    init() {},

    breadcrumb() {
      const m = { dashboard:'ダッシュボード', products:'商品マスタ (No.1)', images:'画像管理 (No.2・5)', emacs:'EMACS連携 (No.3)', prices:'価格管理 (No.4)', box:'BOX連携 (No.5)', channels:'EC連携設定', export:'フォーマットDL', sale:'セール履歴管理', datalink:'データ連携' };
      if (this.page === 'datalink') {
        if (this.datalinkPage === 'connectors') return 'EBISU PIM › データ連携 › コネクタ';
        if (this.datalinkPage === 'mapping') return 'EBISU PIM › データ連携 › コネクタ › マッピング設定';
        if (this.datalinkPage === 'schedule') return 'EBISU PIM › データ連携 › 連携予約状況';
        if (this.datalinkPage === 'history') return 'EBISU PIM › データ連携 › 連携履歴';
        return 'EBISU PIM › データ連携';
      }
      return 'EBISU PIM › ' + (m[this.page] || this.page);
    },

    notify(msg, type) {
      const t = document.getElementById('toast');
      const ic = document.getElementById('toast-icon');
      const mg = document.getElementById('toast-msg');
      mg.textContent = msg;
      const cfg = { success:['bg-green-100','text-green-600','fas fa-check'], info:['bg-blue-100','text-blue-600','fas fa-info'], error:['bg-red-100','text-red-600','fas fa-exclamation'] }[type]||['bg-blue-100','text-blue-600','fas fa-info'];
      ic.className = 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ' + cfg[0];
      ic.innerHTML = '<i class="' + cfg[2] + ' text-xs ' + cfg[1] + '"></i>';
      t.classList.remove('hidden');
      setTimeout(() => t.classList.add('hidden'), 3000);
    },

    openProductAdd() { this.notify('商品追加フォームを開きました', 'info'); },

    // CSV出力ロジック（価格連携 手動チャネル向け）
    exportPriceCsv(channelName) {
      // 対象チャネルの価格改定データを抽出
      const channelMap = { 'ZOZOTOWN': 'ZOZO', 'マルイウェブチャネル': 'マルイ', 'BLOOM ONLINE STORE': 'BLOOM' };
      const shortName = channelMap[channelName] || channelName;
      const targetItems = this.priceItems.filter(p => p.chs.includes(shortName) || p.chs.includes(channelName));

      // CSVヘッダー
      const headers = ['商品コード', '商品名', '現在価格', '改定後価格', '差額', '改定日', '連携先チャネル'];
      const rows = targetItems.map(p => [
        'EST-' + String(p.id).padStart(5,'0'),
        p.name,
        p.cur,
        p.nxt,
        p.nxt - p.cur,
        p.date,
        channelName
      ]);

      // CSV文字列生成
      const csvContent = [headers, ...rows].map(r => r.join(',')).join(String.fromCharCode(10));
      const bom = String.fromCharCode(0xFEFF); // Excel用BOM（UTF-8）
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // ダウンロード実行
      const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'price_update_' + channelName.split(' ').join('_') + '_' + today + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const count = targetItems.length;
      this.notify(channelName + ' の価格CSVを出力しました（' + count + '件）', 'success');
    },

    exportAllPriceCsv() {
      // 3チャネル順番にCSV出力（少し間隔を開けてダウンロード）
      const channels = ['ZOZOTOWN', 'マルイウェブチャネル', 'BLOOM ONLINE STORE'];
      channels.forEach((ch, i) => {
        setTimeout(() => this.exportPriceCsv(ch), i * 400);
      });
      setTimeout(() => {
        this.notify('3チャネル分の価格CSVを一括出力しました', 'success');
      }, channels.length * 400 + 100);
    },

    products: [
      { id:1, name:'ダイヤモンドリング クラシック', nameEn:'Diamond Ring Classic', code:'EST-RG001', emacsCode:'100400020305', category:'リング', skuCount:12, imgCount:8, price:42000, cost:18000, status:'公開中', iconBg:'bg-rose-50', iconColor:'text-rose-300', materials:['Pt900','ダイヤモンド 0.3ct'], channels:['楽天','Amazon','ZOZO'] },
      { id:2, name:'パールネックレス エレガント', nameEn:'Pearl Necklace Elegant', code:'EST-NK002', emacsCode:'100500031201', category:'ネックレス', skuCount:3, imgCount:5, price:28000, cost:11000, status:'公開中', iconBg:'bg-amber-50', iconColor:'text-amber-300', materials:['K18YG','アコヤパール 7.5mm'], channels:['楽天','Shopify'] },
      { id:3, name:'ゴールドピアス シンプル', nameEn:'Gold Earrings Simple', code:'EST-EA003', emacsCode:'100600041008', category:'ピアス', skuCount:6, imgCount:4, price:15800, cost:6200, status:'公開中', iconBg:'bg-yellow-50', iconColor:'text-yellow-400', materials:['K18YG'], channels:['楽天','Amazon','ZOZO','マルイ'] },
      { id:4, name:'プラチナブレスレット', nameEn:'Platinum Bracelet', code:'EST-BR004', emacsCode:'100700052401', category:'ブレスレット', skuCount:4, imgCount:0, price:68000, cost:28000, status:'非公開', iconBg:'bg-gray-50', iconColor:'text-gray-300', materials:['Pt850'], channels:['楽天'] },
      { id:5, name:'サファイアリング ロイヤル', nameEn:'Sapphire Ring Royal', code:'EST-RG005', emacsCode:'100400063015', category:'リング', skuCount:8, imgCount:6, price:89000, cost:38000, status:'公開中', iconBg:'bg-blue-50', iconColor:'text-blue-300', materials:['Pt900','サファイア 1.2ct','ダイヤ'], channels:['楽天','Amazon','TSUNAGU'] },
      { id:6, name:'エメラルドペンダント', nameEn:'Emerald Pendant', code:'EST-NK006', emacsCode:'100500070822', category:'ネックレス', skuCount:2, imgCount:3, price:124000, cost:52000, status:'公開中', iconBg:'bg-emerald-50', iconColor:'text-emerald-300', materials:['K18WG','エメラルド 0.8ct'], channels:['楽天'] },
      { id:7, name:'ルビーピアス ファンシー', nameEn:'Ruby Earrings Fancy', code:'EST-EA007', emacsCode:'100600081104', category:'ピアス', skuCount:5, imgCount:4, price:34500, cost:14000, status:'公開中', iconBg:'bg-red-50', iconColor:'text-red-300', materials:['K18YG','ルビー 0.3ct×2'], channels:['ZOZO','マルイ','Shopify'] },
      { id:8, name:'シルバーブローチ フラワー', nameEn:'Silver Brooch Flower', code:'EST-BC008', emacsCode:'100800090601', category:'ブローチ', skuCount:1, imgCount:2, price:9800, cost:3800, status:'公開中', iconBg:'bg-purple-50', iconColor:'text-purple-300', materials:['SV925'], channels:['楽天','BLOOM'] },
      { id:9, name:'ダイヤネックレス テニス', nameEn:'Diamond Necklace Tennis', code:'EST-NK009', emacsCode:'100500101907', category:'ネックレス', skuCount:3, imgCount:7, price:198000, cost:85000, status:'公開中', iconBg:'bg-slate-50', iconColor:'text-slate-300', materials:['Pt850','ダイヤモンド 2.0ct total'], channels:['楽天','Amazon'] },
      { id:10, name:'ホワイトゴールドリング', nameEn:'White Gold Ring', code:'EST-RG010', emacsCode:'100400112209', category:'リング', skuCount:9, imgCount:5, price:55000, cost:22000, status:'公開中', iconBg:'bg-indigo-50', iconColor:'text-indigo-300', materials:['K18WG'], channels:['楽天','ZOZO','TSUNAGU'] },
    ],

    filteredProds() {
      return this.products.filter(p => {
        const s = this.prodSearch.toLowerCase();
        const ms = !s || p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s);
        const mc = !this.prodCat || p.category === this.prodCat;
        const mst = !this.prodStatus || p.status === this.prodStatus;
        return ms && mc && mst;
      });
    },

    imgItems: Array.from({length:24}, function(_,i) { return {
      id: i+1,
      file: 'EST-' + ['RG','NK','EA','BR','BC'][i%5] + '00' + ((i%9)+1) + '_' + ['WG','YG','PT','SV'][i%4] + '_0' + ((i%5)+1) + '.jpg',
      code: 'EST-' + ['RG','NK','EA','BR','BC'][i%5] + '00' + ((i%9)+1),
      bg: ['bg-rose-50','bg-amber-50','bg-blue-50','bg-emerald-50','bg-purple-50'][i%5],
      ic: ['text-rose-200','text-amber-200','text-blue-200','text-emerald-200','text-purple-200'][i%5],
      isNew: i < 4,
      linked: i % 7 !== 0,  // 後方互換で残すが表示には不使用
    }; }),

    priceItems: [
      { id:1, name:'ダイヤモンドリング クラシック', cur:42000, nxt:46000, date:'2026/06/15', chs:['楽天','Amazon','ZOZO','マルイ'], auto:['楽天','Amazon'] },
      { id:2, name:'パールネックレス エレガント', cur:28000, nxt:30000, date:'2026/06/15', chs:['楽天','Shopify'], auto:['楽天'] },
      { id:3, name:'サファイアリング ロイヤル', cur:89000, nxt:95000, date:'2026/06/15', chs:['楽天','Amazon','TSUNAGU'], auto:['楽天','Amazon','TSUNAGU'] },
      { id:4, name:'エメラルドペンダント', cur:110000, nxt:124000, date:'2026/06/15', chs:['楽天'], auto:['楽天'] },
      { id:5, name:'ゴールドピアス シンプル', cur:14800, nxt:15800, date:'2026/05/15', chs:['楽天','Amazon','ZOZO','マルイ'], auto:['楽天','Amazon'] },
    ],

    channels: [
      { id:1, name:'楽天市場', type:'モール', icon:'🛍', bg:'bg-red-50', on:true, txt:'自動', img:'自動', prc:'自動', last:'06/02 09:30', st:'ok', stTxt:'正常' },
      { id:2, name:'Amazon', type:'モール', icon:'📦', bg:'bg-amber-50', on:true, txt:'自動', img:'手動CSV', prc:'自動', last:'06/01 12:00', st:'warn', stTxt:'3件エラー' },
      { id:3, name:'ZOZOTOWN', type:'モール', icon:'👗', bg:'bg-gray-50', on:true, txt:'手動CSV', img:'手動CSV', prc:'自動', last:'06/02 08:00', st:'ok', stTxt:'正常' },
      { id:4, name:'マルイウェブチャネル', type:'モール', icon:'🏬', bg:'bg-blue-50', on:true, txt:'手動CSV', img:'手動CSV', prc:'自動', last:'06/01 18:00', st:'ok', stTxt:'正常' },
      { id:5, name:'NAKASHI JEWEL GARDEN', type:'Shopify', icon:'💎', bg:'bg-purple-50', on:true, txt:'手動CSV', img:'手動CSV', prc:'自動', last:'06/02 07:30', st:'ok', stTxt:'正常' },
      { id:6, name:'Zsystem (Shopify)', type:'Shopify', icon:'🔷', bg:'bg-indigo-50', on:true, txt:'手動CSV', img:'手動CSV', prc:'自動', last:'06/02 07:30', st:'ok', stTxt:'正常' },
      { id:7, name:'BLOOM ONLINE STORE', type:'PVS', icon:'🌸', bg:'bg-pink-50', on:true, txt:'手動CSV', img:'手動CSV', prc:'自動', last:'06/01 20:00', st:'ok', stTxt:'正常' },
      { id:8, name:'TSUNAGUオーダー', type:'EBISUMART', icon:'🔗', bg:'bg-green-50', on:true, txt:'自動', img:'自動', prc:'自動', last:'06/02 09:00', st:'ok', stTxt:'正常' },
      { id:9, name:'ネクストエンジン', type:'在庫管理', icon:'⚙️', bg:'bg-orange-50', on:false, txt:'要件定義中', img:'要件定義中', prc:'確認中', last:'未設定', st:'warn', stTxt:'設定中' },
    ],

    exportFmts: [
      { id:1, name:'楽天市場フォーマット', desc:'楽天RMSの商品登録CSV', ready:true, last:'06/01 16:45' },
      { id:2, name:'ZOZOTOWNフォーマット', desc:'ZOZO商品一括登録CSV', ready:true, last:'06/02 10:00' },
      { id:3, name:'マルイウェブチャネル', desc:'マルイ商品登録フォーマット', ready:true, last:'05/28 14:30' },
      { id:4, name:'Shopify (NKS)', desc:'Shopify商品インポート用CSV', ready:true, last:'06/01 09:00' },
      { id:5, name:'BLOOM ONLINE STORE', desc:'PVS用商品CSVフォーマット', ready:false, last:'05/20 11:00' },
      { id:6, name:'PR用商品一覧', desc:'広報向け商品情報エクスポート', ready:true, last:'06/02 08:00' },
    ],

    csvFields: ['商品コード','商品名','カテゴリ','素材','カラー','サイズ','販売価格','在庫数','商品説明','メインURL','サブ画像URL','JAN','生産コード','ブランド'],

    // ===== SALE =====
    saleTab: 'list',
    saleSearch: '',
    csvSaleName: '',
    csvSaleStart: '',
    csvSaleEnd: '',
    csvUploaded: false,
    csvResult: false,

    sales: [
      { id:1, no:'SL-2026-001', name:'2026夏ジュエリーセール', memo:'楽天・Amazon向け夏季限定', start:'2026/07/01', end:'2026/07/31', channels:['楽天市場','Amazon'], itemCount:24, createdAt:'2026/06/01', status:'予定' },
      { id:2, no:'SL-2026-002', name:'ブライダルフェア2026', memo:'Shopify・楽天 ブライダル特集', start:'2026/06/01', end:'2026/06/30', channels:['楽天市場','Shopify(NKS)'], itemCount:18, createdAt:'2026/05/20', status:'開催中' },
      { id:3, no:'SL-2026-003', name:'母の日セール', memo:'全モール対応', start:'2026/05/01', end:'2026/05/12', channels:['楽天市場','Amazon','ZOZOTOWN','マルイウェブ'], itemCount:31, createdAt:'2026/04/15', status:'終了' },
      { id:4, no:'SL-2026-004', name:'ZOZOスーパーSALE', memo:'ZOZO限定 最大15%OFF', start:'2026/06/04', end:'2026/06/11', channels:['ZOZOTOWN'], itemCount:47, createdAt:'2026/05/25', status:'開催中' },
      { id:5, no:'SL-2026-005', name:'楽天スーパーSALE 6月', memo:'楽天スーパーSALE参加', start:'2026/06/04', end:'2026/06/11', channels:['楽天市場'], itemCount:62, createdAt:'2026/05/28', status:'開催中' },
      { id:6, no:'SL-2025-012', name:'2025クリスマスセール', memo:'年末年始 全モール', start:'2025/12/20', end:'2025/12/26', channels:['楽天市場','Amazon','ZOZOTOWN','マルイウェブ','Shopify(NKS)'], itemCount:55, createdAt:'2025/12/01', status:'終了' },
    ],

    filteredSales() {
      const q = this.saleSearch.toLowerCase();
      if (!q) return this.sales;
      return this.sales.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.no.toLowerCase().includes(q) ||
        s.memo.toLowerCase().includes(q)
      );
    },

    openSaleDetail(s) {
      document.getElementById('modalSaleName').textContent = s.name;
      document.getElementById('modalSaleNo').textContent = s.no + ' ｜ ' + s.start + ' 〜 ' + s.end;
      const items = [
        { code:'EST-RG001', name:'ダイヤモンドリング クラシック', sku:'EST-RG001-WG-11', price:42000, salePrice:37800, channel: s.channels[0] || '楽天市場' },
        { code:'EST-NK002', name:'パールネックレス エレガント',   sku:'EST-NK002-YG-01', price:28000, salePrice:24500, channel: s.channels[0] || '楽天市場' },
        { code:'EST-EA003', name:'ゴールドピアス シンプル',        sku:'EST-EA003-YG-01', price:15800, salePrice:13800, channel: s.channels[1] || s.channels[0] || 'Amazon' },
        { code:'EST-RG005', name:'サファイアリング ロイヤル',      sku:'EST-RG005-PT-13', price:89000, salePrice:79000, channel: s.channels[0] || '楽天市場' },
      ];
      const statusBadge = s.status === '開催中'
        ? '<span class="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">開催中</span>'
        : s.status === '予定'
        ? '<span class="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">予定</span>'
        : '<span class="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">終了</span>';
      const chBadges = s.channels.map(function(c) { return '<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">' + c + '</span>'; }).join(' ');
      const rows = items.map(function(it) {
        const rate = Math.round((it.price - it.salePrice) / it.price * 100);
        return '<tr class="hover:bg-gray-50">'
          + '<td class="px-4 py-2.5 font-mono text-xs text-gray-500">' + it.code + '</td>'
          + '<td class="px-4 py-2.5 text-xs text-gray-700">' + it.name + '</td>'
          + '<td class="px-4 py-2.5 font-mono text-xs text-gray-400">' + it.sku + '</td>'
          + '<td class="px-4 py-2.5 text-xs text-gray-500">&#165;' + it.price.toLocaleString() + '</td>'
          + '<td class="px-4 py-2.5 text-xs font-bold text-rose-600">&#165;' + it.salePrice.toLocaleString() + '</td>'
          + '<td class="px-4 py-2.5 text-xs font-semibold text-green-600">-' + rate + '%</td>'
          + '<td class="px-4 py-2.5 text-xs text-gray-500">' + it.channel + '</td>'
          + '</tr>';
      }).join('');
      document.getElementById('saleDetailContent').innerHTML =
        '<div class="grid grid-cols-2 gap-3 mb-5 text-sm">'
        + '<div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">ステータス</div><div>' + statusBadge + '</div></div>'
        + '<div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">登録日</div><div class="text-gray-700 text-xs">' + s.createdAt + '</div></div>'
        + '<div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">セール期間</div><div class="text-gray-700 text-xs">' + s.start + ' 〜 ' + s.end + '</div></div>'
        + '<div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-1">対象商品数</div><div class="font-bold text-gray-800">' + s.itemCount + '件</div></div>'
        + '<div class="col-span-2 bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-400 mb-2">コネクタ/ショップ</div><div class="flex gap-1 flex-wrap">' + chBadges + '</div></div>'
        + '</div>'
        + '<h4 class="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2"><i class="fas fa-list text-slate-400 text-xs"></i> 対象商品/SKU 一覧（抜粋）</h4>'
        + '<div class="overflow-hidden rounded-xl border border-gray-100">'
        + '<table class="w-full text-xs">'
        + '<thead class="bg-gray-50"><tr>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">商品コード</th>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">商品名</th>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">SKU</th>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">通常価格</th>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">セール価格</th>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">割引率</th>'
        + '<th class="text-left px-4 py-2.5 text-gray-400 font-medium">チャネル</th>'
        + '</tr></thead>'
        + '<tbody class="divide-y divide-gray-50">' + rows + '</tbody>'
        + '</table>'
        + '</div>'
        + '<div class="mt-4 flex justify-end gap-2">'
        + '<button onclick="document.getElementById(&apos;saleDetailModal&apos;).classList.remove(&apos;show&apos;)" class="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50">閉じる</button>'
        + '</div>';
      document.getElementById('saleDetailModal').classList.add('show');
    },

    triggerCsvUpload() {
      this.csvUploaded = true;
    },
    runCsvUpload() {
      if (!this.csvSaleName) { this.notify('セール名を入力してください', 'error'); return; }
      this.csvResult = true;
      this.notify('CSVを処理しました（成功49件 / エラー3件）', 'info');
    },

    newSaleItems: [
      { code:'EST-RG001', name:'ダイヤモンドリング クラシック', price:42000, salePrice:37800 },
      { code:'EST-NK002', name:'パールネックレス エレガント', price:28000, salePrice:18000 },
      { code:'EST-EA003', name:'ゴールドピアス シンプル', price:15800, salePrice:13800 },
      { code:'EST-RG005', name:'サファイアリング ロイヤル', price:89000, salePrice:79000 },
    ],

    // ===== CONNECTORS DATA =====
    myConnectors: [
      { id:1, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'rakuten_honda', shopName:'rakuten_honda' },
      { id:2, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'テスト0710', shopName:'テスト0710' },
      { id:3, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'20260513YZ', shopName:'20260513山番様' },
      { id:4, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'20260224', shopName:'202602241137' },
      { id:5, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'Rakuten0710', shopName:'Rakuten0710' },
      { id:6, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'test', shopName:'楽天 確認店舗' },
      { id:7, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'test', shopName:'20260220_02_test' },
      { id:8, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'test', shopName:'20260302_test' },
      { id:9, brand:'rakuten', brandLabel:'Rakuten', typeName:'RMS連携', urlLabel:'店舗URI', shopUrl:'test', shopName:'test' },
      { id:10, brand:'ebisumart', brandLabel:'EBISUMART', typeName:'EBISUMART連携', urlLabel:'サイトURL', shopUrl:'tsunagu.ebisumart.com', shopName:'TSUNAGUオーダー' },
      { id:11, brand:'ebisumart', brandLabel:'EBISUMART', typeName:'EBISUMART連携', urlLabel:'サイトURL', shopUrl:'nakashi.ebisumart.com', shopName:'NAKASHI JEWEL GARDEN' },
    ],

    connectorTemplates: [
      { id:1, name:'楽天市場 RMS', desc:'楽天市場のRMS APIを使った商品・価格・在庫連携', iconBg:'bg-red-50', icon:'fas fa-shopping-cart text-red-500' },
      { id:2, name:'EBISUMART', desc:'EBISUMARTのAPIを使った商品データ連携', iconBg:'bg-blue-50', icon:'fas fa-store text-blue-500' },
      { id:3, name:'Amazon SP-API', desc:'AmazonのSelling Partner APIを使った商品連携', iconBg:'bg-amber-50', icon:'fas fa-amazon text-amber-600' },
      { id:4, name:'ZOZOTOWN', desc:'ZOZOTOWNへのCSV形式での商品データ連携', iconBg:'bg-gray-50', icon:'fas fa-tshirt text-gray-500' },
      { id:5, name:'Shopify', desc:'Shopify Admin APIを使った商品・在庫連携', iconBg:'bg-green-50', icon:'fas fa-shopping-bag text-green-500' },
      { id:6, name:'マルイウェブチャネル', desc:'マルイウェブチャネルへのCSV連携', iconBg:'bg-purple-50', icon:'fas fa-building text-purple-500' },
    ],

    connectorJobs: [
      { id:1, name:'商品データ更新用定期実行ジョブ', method:'商品データ更新用定期実行ジョブ', active:true, schedule:'毎日 03:00', lastRun:'2026/07/05 03:01', lastStatus:'成功',
        toFields:['商品番号','SKU','商品名','商品説明','価格','在庫数'] },
      { id:2, name:'画像アップロードジョブ', method:'画像一括アップロード', active:true, schedule:'毎週月 00:00', lastRun:'2026/07/04 00:01', lastStatus:'成功',
        toFields:['商品番号','画像URL（メイン）','画像URL（サブ1）','画像URL（サブ2）'] },
      { id:3, name:'在庫・価格同期ジョブ', method:'在庫・価格リアルタイム同期', active:false, schedule:'毎時', lastRun:'2026/07/03 10:00', lastStatus:'停止中',
        toFields:['商品番号','SKU','価格','在庫数'] },
    ],

    pimFields: [
      { value:'product_code', label:'商品マスタ.商品コード' },
      { value:'product_name', label:'商品マスタ.商品名' },
      { value:'product_name_en', label:'商品マスタ.商品名(英語)' },
      { value:'product_desc', label:'商品マスタ.商品説明' },
      { value:'category', label:'商品マスタ.カテゴリ' },
      { value:'material', label:'商品マスタ.素材' },
      { value:'sku_code', label:'SKUマスタ.SKUコード' },
      { value:'sku_color', label:'SKUマスタ.カラー' },
      { value:'sku_size', label:'SKUマスタ.サイズ' },
      { value:'price_normal', label:'価格マスタ.通常価格' },
      { value:'price_sale', label:'価格マスタ.セール価格' },
      { value:'stock', label:'在庫マスタ.在庫数' },
      { value:'image_main', label:'画像マスタ.メイン画像URL' },
      { value:'image_sub1', label:'画像マスタ.サブ画像1URL' },
      { value:'image_sub2', label:'画像マスタ.サブ画像2URL' },
      { value:'emacs_code', label:'EMACSコード.生産コード' },
    ],

    openJobManager(conn) {
      this.selectedConnector = conn;
      this.datalinkPage = 'jobs';
    },

    openMapping(job) {
      this.selectedJob = job;
      // Initialize mapping rows from job's toFields
      this.mappingRows = job.toFields.map((f, i) => ({
        from: ['product_code','sku_code','product_name','product_desc','price_normal','stock','image_main','image_sub1'][i] || '',
        to: f,
        transforms: []
      }));
      this.datalinkPage = 'mapping';
    },

    addMappingRow() {
      const toFieldLabel = 'TO項目' + (this.mappingRows.length + 1);
      this.mappingRows.push({ from: '', to: toFieldLabel, transforms: [] });
    },
  }
}
</script>
</body>
</html>`
}

export default app

