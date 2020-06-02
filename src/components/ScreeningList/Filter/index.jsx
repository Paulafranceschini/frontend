import React, { useEffect, useState, useCallback } from 'react';
import isEmpty from 'lodash.isempty';
import moment from 'moment';
import 'moment/locale/pt-br';
import { subDays } from 'date-fns';

import message from '@components/message';
import Heading from '@components/Heading';
import { Row, Col } from '@components/Grid';
import { Select, DatePicker } from '@components/Inputs';
import { Box, SearchBox } from './Filter.style';
import Tooltip from '@components/Tooltip';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Badge from '@components/Badge';
import './index.css';

export default function Filter({
  fetchPrescriptionsList,
  segments,
  fetchDepartmentsList,
  resetDepartmentsLst,
  updatePrescriptionListStatus,
  filter,
  setScreeningListFilter,
  isFetchingPrescription
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(moment());

  const getParams = useCallback(
    forceParams => {
      const params = {
        idSegment: filter.idSegment,
        idDept: filter.idDepartment,
        date: date ? date.format('YYYY-MM-DD') : 'all'
      };
      const mixedParams = { ...params, ...forceParams };
      const finalParams = {};

      for (const key in mixedParams) {
        if (mixedParams[key] !== 'all') {
          finalParams[key] = mixedParams[key];
        }
      }

      return finalParams;
    },
    [filter, date]
  );

  useEffect(() => {
    if (!isEmpty(segments.error)) {
      message.error(segments.error.message);
    }
  }, [segments.error]);

  useEffect(() => {
    if (filter.idSegment == null) return;

    if (filter.idSegment !== 'all') {
      fetchDepartmentsList(filter.idSegment);
    } else {
      resetDepartmentsLst();
    }
  }, [filter.idSegment, fetchDepartmentsList, resetDepartmentsLst]);

  // update list status
  const updateStatus = useCallback(() => {
    if (segments.list.length === 0) return;

    updatePrescriptionListStatus(getParams());
  }, [segments, updatePrescriptionListStatus, getParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateStatus();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [updateStatus]);

  useEffect(() => {
    window.addEventListener('focus', updateStatus);

    return () => {
      window.removeEventListener('focus', updateStatus);
    };
  }, [updateStatus]);

  const onDepartmentChange = idDept => {
    setScreeningListFilter({ idDepartment: idDept });
  };

  const onDateChange = dt => {
    setDate(dt);
  };

  useEffect(() => {
    if (!filter.idSegment && segments.list.length) {
      setScreeningListFilter({ idSegment: segments.list[0].id });
      fetchPrescriptionsList(getParams({ idSegment: segments.list[0].id }));
    }
  }, [segments.list, filter.idSegment, setScreeningListFilter, fetchPrescriptionsList, getParams]);

  useEffect(() => {
    if (filter.idSegment) {
      fetchPrescriptionsList(getParams());
    }
  }, []); // eslint-disable-line

  const disabledDate = current => {
    return current < subDays(new Date(), 8) || current > new Date();
  };

  const search = () => {
    fetchPrescriptionsList(getParams());
    setOpen(false);
  };

  const reset = () => {
    setScreeningListFilter({
      idSegment: segments.list[0].id,
      idDepartment: []
    });
    setDate(moment());
  };

  const countHiddenFilters = filters => {
    const skip = ['idSegment'];
    let count = 0;

    Object.keys(filters).forEach(key => {
      if (skip.indexOf(key) !== -1) return;

      if (!isEmpty(filter[key])) {
        count++;
      }
    });

    return count;
  };

  const hiddenFieldCount = countHiddenFilters(filter);
  return (
    <SearchBox className={open ? 'open' : ''}>
      <Row gutter={[16, 16]} type="flex">
        <Col md={8}>
          <Box>
            <Heading as="label" htmlFor="segments" size="14px">
              Segmento:
            </Heading>
            <Select
              id="segments"
              style={{ width: '100%' }}
              placeholder="Selectione um segmento..."
              loading={segments.isFetching}
              onChange={idSegment => setScreeningListFilter({ idSegment, idDepartment: [] })}
              value={filter.idSegment}
            >
              {segments.list.map(({ id, description: text }) => (
                <Select.Option key={id} value={id}>
                  {text}
                </Select.Option>
              ))}
            </Select>
          </Box>
        </Col>
        <Col md={3}>
          <Box>
            <Heading as="label" htmlFor="date" size="14px">
              Data:
            </Heading>
            <DatePicker
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
              value={date}
              onChange={onDateChange}
              dropdownClassName="noArrow"
              allowClear={false}
            />
          </Box>
        </Col>
        <Col md={4}>
          <div style={{ display: 'flex' }}>
            <Tooltip title={hiddenFieldCount > 0 ? 'Existem mais filtros aplicados' : ''}>
              <Button
                type="link gtm-btn-adv-search"
                onClick={() => setOpen(!open)}
                style={{ marginTop: '14px' }}
              >
                <Badge count={hiddenFieldCount}>Ver mais</Badge>
                <Icon type={open ? 'caret-up' : 'caret-down'} />
              </Button>
            </Tooltip>

            <Tooltip title="Pesquisar">
              <Button
                type="secondary gtm-btn-search"
                shape="circle"
                icon="search"
                onClick={search}
                size="large"
                style={{ marginTop: '7px' }}
                loading={isFetchingPrescription}
              />
            </Tooltip>
            <Tooltip title="Limpar filtros">
              <Button
                className="gtm-btn-reset"
                shape="circle"
                icon="delete"
                onClick={reset}
                size="medium"
                style={{ marginTop: '11px', marginLeft: '5px' }}
                loading={isFetchingPrescription}
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col md={14}>
          <Box>
            <Heading as="label" htmlFor="departments" size="14px">
              Setor:
            </Heading>
            <Select
              id="departments"
              mode="multiple"
              optionFilterProp="children"
              style={{ width: '100%' }}
              placeholder="Selectione os setores..."
              loading={segments.single.isFetching}
              value={filter.idDepartment}
              onChange={onDepartmentChange}
              autoClearSearchValue={false}
              allowClear
            >
              {segments.single.content.departments &&
                segments.single.content.departments.map(({ idDepartment, name }) => (
                  <Select.Option key={idDepartment} value={idDepartment}>
                    {name}
                  </Select.Option>
                ))}
            </Select>
          </Box>
        </Col>
      </Row>
      <Row gutter={20} style={{ marginTop: '10px' }} type="flex">
        <Col md={14}>
          <div className="search-box-buttons">
            <Button onClick={reset}>Limpar</Button>
            <Button type="secondary" onClick={search} loading={isFetchingPrescription}>
              Pesquisar
            </Button>
          </div>
        </Col>
      </Row>
    </SearchBox>
  );
}
