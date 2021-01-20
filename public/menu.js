const electron = require('electron'); // eslint-disable-line

const { Menu } = electron;
const { dialog } = electron;

const { homepage, releasesPage } = require('./constants');

module.exports = (app, mainWindow, newVersion) => {
  const menu = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),

    {
      label: '文件',
      submenu: [
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          async click() {
            const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
            if (canceled) return;
            mainWindow.webContents.send('file-opened', filePaths);
          },
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          async click() {
            mainWindow.webContents.send('close-file');
          },
        },
        { type: 'separator' },
        {
          label: '打开项目 (CSV)',
          click() {
            mainWindow.webContents.send('importEdlFile', 'csv');
          },
        },
        {
          label: '保存项目 (CSV)',
          click() {
            mainWindow.webContents.send('exportEdlFile', 'csv');
          },
        },
        {
          label: '导入项目',
          submenu: [
            {
              label: 'Text chapters / YouTube',
              click() {
                mainWindow.webContents.send('importEdlFile', 'youtube');
              },
            },
            {
              label: 'DaVinci Resolve / Final Cut Pro XML',
              click() {
                mainWindow.webContents.send('importEdlFile', 'xmeml');
              },
            },
            {
              label: 'CUE sheet file',
              click() {
                mainWindow.webContents.send('importEdlFile', 'cue');
              },
            },
            {
              label: 'PotPlayer Bookmarks (.pbf)',
              click() {
                mainWindow.webContents.send('importEdlFile', 'pbf');
              },
            },
          ],
        },
        {
          label: '导出项目',
          submenu: [
            {
              label: '时间戳 (CSV)',
              click() {
                mainWindow.webContents.send('exportEdlFile', 'csv-human');
              },
            },
            {
              label: '时间戳 (TSV/TXT)',
              click() {
                mainWindow.webContents.send('exportEdlFile', 'tsv-human');
              },
            },
          ],
        },
        { type: 'separator' },
        {
          label: '转换为支持的格式',
          click() {
            mainWindow.webContents.send('html5ify');
          },
        },
        {
          label: '修复错误的时长',
          click() {
            mainWindow.webContents.send('fixInvalidDuration');
          },
        },
        { type: 'separator' },

        { type: 'separator' },
        {
          label: '设置',
          click() {
            mainWindow.webContents.send('openSettings');
          },
        },
        { type: 'separator' },
        {
          label: '退出',
          click() {
            app.quit();
          },
        },
      ],
    },

    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          click() {
            mainWindow.webContents.send('undo');
          },
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          click() {
            mainWindow.webContents.send('redo');
          },
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
        { type: 'separator' },
        {
          label: '片段',
          submenu: [
            {
              label: '清除所有片段',
              click() {
                mainWindow.webContents.send('clearSegments');
              },
            },
            {
              label: '根据片段起始位置重新排序',
              click() {
                mainWindow.webContents.send('reorderSegsByStartTime');
              },
            },
            {
              label: '创建多个片段并等分时间轴',
              click() {
                mainWindow.webContents.send('createNumSegments');
              },
            },
            {
              label: '创建指定长度的片段并填充时间轴',
              click() {
                mainWindow.webContents.send('createFixedDurationSegments');
              },
            },
          ],
        },
        {
          label: '轨道',
          submenu: [
            {
              label: '提取所有轨道',
              click() {
                mainWindow.webContents.send('extract-all-streams');
              },
            },
            {
              label: '编辑轨道/元数据标签',
              click() {
                mainWindow.webContents.send('showStreamsSelector');
              },
            },
          ],
        },
      ],
    },

    {
      label: '视图',
      submenu: [
        { role: 'togglefullscreen' },
      ],
    },

    // On Windows the windowMenu has a close Ctrl+W which clashes with File->Close shortcut
    ...(process.platform === 'darwin'
      ? [{ role: 'windowMenu' }]
      : [{
        label: '窗口',
        submenu: [{ role: 'minimize' }],
      }]
    ),

    {
      label: '工具',
      submenu: [
        {
          label: '合并视频',
          click() {
            mainWindow.webContents.send('show-merge-dialog', true);
          },
        },
        {
          label: '批量转换为支持的格式',
          click() {
            mainWindow.webContents.send('batchConvertFriendlyFormat');
          },
        },
        {
          label: '设置自定义的起始偏移量/时间码',
          click() {
            mainWindow.webContents.send('set-start-offset', true);
          },
        },
        { role: 'toggleDevTools' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: '说明和快捷键介绍',
          click() {
            mainWindow.webContents.send('openHelp');
          },
        },
        {
          label: '关于',
          click() {
            mainWindow.webContents.send('openAbout');
          },
        },
        {
          label: '了解更多',
          click() { electron.shell.openExternal(homepage); },
        },
        {
          label: '汇报错误',
          click() { mainWindow.webContents.send('openSendReportDialog'); },
        },
      ],
    },
  ];

  if (newVersion) {
    menu.push({
      label: 'New version!',
      submenu: [
        {
          label: `Download ${newVersion}`,
          click() { electron.shell.openExternal(releasesPage); },
        },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
};
