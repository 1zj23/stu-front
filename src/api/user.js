import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/stu/tbUser/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/stu/tbUser/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/stu/tbUser/logout',
    method: 'post'
  })
}
