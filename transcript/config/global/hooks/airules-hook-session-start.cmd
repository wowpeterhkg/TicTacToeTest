@echo off
REM airules SessionStart hook wrapper for Windows.
REM
REM Why this exists: bin/airules is a POSIX shell script with no file extension,
REM so Windows cannot execute it directly -- a direct hook invocation hangs.
REM It also must run from the REPO copy, not ~/.local/bin/airules: on Windows the
REM installer's symlink falls back to a plain copy, and the copied script then
REM resolves AIRULES_HOME to ~/.local and fails to find lib/common.sh.
REM
REM The filename deliberately contains "hook-session-start" -- lib/merge_settings.py
REM uses that literal string to recognise its own hook entries in settings.json.
REM Renaming this file will orphan the hooks on uninstall.
REM
REM Usage: airules-hook-session-start.cmd <startup|resume|clear|compact>
"C:\Program Files\Git\bin\bash.exe" -lc "'/c/Users/wowpeter/.local/share/airules/repo/bin/airules' hook-session-start --event %1"
