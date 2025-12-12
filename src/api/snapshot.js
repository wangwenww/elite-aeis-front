import http from './http';
import { SNAPSHOT_API } from '../API_Interfaces';

export const snapshotApi = {
  // 获取快照列表
  getSnapshots(params) {
    return http.get(SNAPSHOT_API.GET_SNAPSHOTS, { params });
  },

  // 删除快照
  deleteSnapshot(id) {
    return http.delete(SNAPSHOT_API.DELETE_SNAPSHOT(id));
  },

  // 获取单个快照
  getSnapshot(id) {
    return http.get(SNAPSHOT_API.GET_SNAPSHOT(id));
  },

  // 获取快照项
  getSnapshotItem(id) {
    return http.get(SNAPSHOT_API.GET_SNAPSHOT_ITEM(id));
  },
};