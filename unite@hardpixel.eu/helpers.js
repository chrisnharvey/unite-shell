const Config = imports.misc.config;
const Gio    = imports.gi.Gio;
const Main   = imports.ui.main;
const Meta   = imports.gi.Meta;

function getXWindow(win) {
  try {
    return win.get_description().match(/0x[0-9a-f]+/)[0];
  } catch (err) {
    return null;
  }
}

function getAllWindows() {
  let windows = global.get_window_actors().map(function (win) {
    return win.meta_window;
  });

  windows = windows.filter(function(win) {
    return win.window_type !== Meta.WindowType.DESKTOP;
  });

  return windows;
}

function getWindowButtons(return_only) {
  let prefs  = new Gio.Settings({ schema_id: 'org.gnome.desktop.wm.preferences' });
  let layout = prefs.get_string('button-layout');
  let order  = layout.replace(/ /g, '').split(':');

  if (order.length < 2) {
    return null;
  }

  let buttons  = collectWindowButtons(order[1].split(','));
  let position = 'right';

  if (!buttons) {
    buttons  = collectWindowButtons(order[0].split(','));
    position = 'left';
  }

  if (return_only == 'position') {
    return position;
  } else if (return_only == 'buttons') {
    return buttons;
  } else {
    return [position, buttons];
  }
}

function collectWindowButtons(layout_items) {
  let names = ['close', 'minimize', 'maximize'];
  let items = [];

  layout_items.forEach(function (item) {
    if (names.indexOf(item) > -1) {
      items.push(item);
    }
  });

  if (items.length == 0) {
    items = null;
  }

  return items;
}

function overviewSignalIDs() {
  let signals = Main.overview._signalConnections.map(function (item) {
    if (item.disconnected) {
      return 0;
    } else {
      return item.id;
    }
  });

  return signals;
}

function isMaximized(win) {
  let check = false;

  if (win) {
    let primaryScreen = win.is_on_primary_monitor();
    let fullMaximized = win.get_maximized() == Meta.MaximizeFlags.BOTH;

    check = primaryScreen && fullMaximized;
  }

  return check;
}

function getVersion() {
  let version = Config.PACKAGE_VERSION.match(/\d+.\d+/);
  return parseFloat(version);
}
