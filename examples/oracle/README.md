# Oracle datasource

Set a datasource's `type` to `oracle` and use the existing `sql` step. Oracle support is loaded lazily so users who do not need it keep the existing runtime.

Install `oracledb` and Oracle Instant Client for the Electron/Node runtime before using it. The datasource uses the usual node-oracledb connection properties, for example `user`, `password`, and `connectString`.
