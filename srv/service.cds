using com.moyo.demo.myfiorielementsproject as my from '../db/schema';

service MainService {
  @readonly entity Data as projection on my.Data;
}
