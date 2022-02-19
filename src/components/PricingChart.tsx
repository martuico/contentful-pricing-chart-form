import React, { useEffect, useState } from 'react';
import {
  Heading,
  Button,
  EditorToolbar,
  FieldGroup,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  Pill,
  TableBody,
  Select,
  Option,
  EditorToolbarButton
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK, EntryAPI } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

interface Package {
  id: string;
  name: string;
  packages: Array<any>;
}

interface PricingChartTable {
  id: string;
  name: string;
  options: Array<string>;
  rows: Array<Package>;
}

const createPricingChartTable = () => {
  return {
    id: uuid(),
    name: '',
    options: ["Checked"],
    rows: [],
  };
}

const createRowItem = (packages: Array<any>) => {
  return {
    id: uuid(),
    name: '',
    packages
  }
}

const PricingChart = (props: FieldProps) => {
  const [pricingChartTables, setPricingChartTable] = useState<PricingChartTable[]>([]);
  const [optionName, setOptionName] = useState("");
  const [packages, setPackages] = useState<any[]>([]);
  const [packagesIds, setPackagesIds] = useState([]);
  const [ctr, setCtr] = useState(0)
  useEffect(() => {
    props.sdk.window.startAutoResizer();
    setCtr(ctr+ 1)
  }, [])

  useEffect(() => {
    props.sdk.entry.fields.packages.onValueChanged((value) => {
      setCtr(ctr+1)
        if(Array.isArray(value)) {
            setPackagesIds([])
            setPackagesIds(Object.assign([], value.map((s) => s.sys.id)))
        }
    })
  }, [props.sdk.entry.fields.packages])

  useEffect(() => {
    props.sdk.field.onValueChanged((value: PricingChartTable[]) => {
      if (Array.isArray(value)) {
        setPricingChartTable(value);
      }
    });
  }, [props.sdk.field])


  useEffect(() => {
    if(ctr) {
      const ids = packagesIds.concat()
      const packList: any = [];
      ids.forEach(async (id: any, index: number) => {
        await props.sdk.space.getEntry(id)
              .then((res) => {
                packList.push(res)
              })
        if(ids.length - 1 === index) {
          setPackages(packList)
        }
      })
    }
  }, [ctr, packagesIds])

  const setPricingChartOption = (id: string) => {
    const itemList = props.sdk.field.getValue().concat();
    const index = itemList.findIndex((i: any) => i.id === id);
    itemList[index].options.push(optionName);
    props.sdk.field.setValue(itemList)
  }

  const deleteTableChartOption = (id: string, ind: number) => {
    const itemList = props.sdk.field.getValue().concat();
    const index = itemList.findIndex((i: any) => i.id === id);
    itemList[index].options.splice(ind, 1);
    props.sdk.field.setValue(itemList)
  }

  const addNewPricingChartTable = () => {
    props.sdk.field.setValue([...pricingChartTables, createPricingChartTable()])
    setPricingChartTable(props.sdk.field.getValue());
  }

  const setPricingChartTableName = (id: string, name: string) => {
    const itemList = props.sdk.field.getValue().concat();
    const index = itemList.findIndex((i: any) => i.id === id);
    itemList[index].name = name
    props.sdk.field.setValue(itemList)
  }

  const createOnChangeListName = (id:string ,pack: Package, property: 'name' | 'packages') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const itemList = props.sdk.field.getValue().concat();
    const index = itemList.findIndex((i: any) => i.id === id);

    const list = itemList[index].rows.concat()
    const listInd = list.findIndex((i: any) => i.id === pack.id)

    list.splice(listInd, 1 ,{ ...pack, [property]: e.target.value, packages:
      packages.map(p  => {
        const obj = p.fields.internalName
        return {name: obj[Object.keys(obj)[0]], value: ''}
      })
    }) //list
    itemList[index].rows = list

    setPricingChartTable(itemList)
    props.sdk.field.setValue(itemList);
  }

  const updateOnChangeSelector = (id: string, rowIndex: number, packageInd: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pricingTables = props.sdk.field.getValue().concat();
    const pricingTablesInd = pricingTables.findIndex((i: any) => i.id === id);

    const row = pricingTables[pricingTablesInd].rows[rowIndex]
    const packs = row.packages[packageInd]
    packs.value = e.target.value

    props.sdk.field.setValue(pricingTables)
    setPricingChartTable(pricingTables)

  }

  const addNewListItem = (id: string) => {
    const itemList = props.sdk.field.getValue().concat();
    const index = itemList.findIndex((i: any) => i.id === id);
    const packagesName = packages.map(p  => {
      const obj = p.fields.internalName
      return {id: uuid(), name: obj[Object.keys(obj)[0]], value: ''}
    })
    itemList[index].rows.push(createRowItem(packagesName))
    setPricingChartTable(itemList)
    props.sdk.field.setValue(itemList);

  }

  const deleteRowItem = (id: string, ind: number) => {
    const itemList = props.sdk.field.getValue().concat();
    const index = itemList.findIndex((i: any) => i.id === id);
    itemList[index].rows.splice(ind, 1)
    setPricingChartTable(itemList)
    props.sdk.field.setValue(itemList);
  }


  return (
    <>
      <EditorToolbar style={{ justifyContent: 'space-between' }}>
        <div>
          <Heading>
            Pricing Chart
          </Heading>
        </div>
        <div>
          <Button size="small" buttonType="muted"
            onClick={addNewPricingChartTable}>
            Add Pricing Chart Table
          </Button>
        </div>
      </EditorToolbar>
      {
        pricingChartTables &&
          pricingChartTables.map((pricing) => {
            return (
              <div key={pricing.id}>
                <FieldGroup style={{ marginTop: tokens.spacingL }}>
                  <TextField
                    required
                    name="tableName"
                    id="tableName"
                    labelText="Pricing Chart Table Name"
                    value={pricing.name}
                    onChange={(e) => setPricingChartTableName(pricing.id, e.target.value)}
                    textLinkProps={{
                      icon: 'HorizontalRule',
                      text: 'Clict to remove Pricing',
                      onClick: (e: any) => {
                          const itemList = pricingChartTables.concat();
                          const index = itemList.findIndex((i: any) => i.id === pricing.id);
                          itemList.splice(index, 1);
                          setPricingChartTable(itemList);
                          props.sdk.field.setValue(itemList);
                          setOptionName('')
                      },
                    }}
                  />
                </FieldGroup>
                <FieldGroup>
                  <TextField
                    name={"optionSelector-"+ pricing.id}
                    id={"optionSelector-"+ pricing.id}
                    labelText="Pricing Chart Selector Type"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    textLinkProps={{
                      icon: 'PlusCircleTrimmed',
                      text: 'Clict to add',
                      onClick: (e: any) => {
                          setPricingChartOption(pricing.id);
                          setOptionName('')
                      },
                    }}
                  />
                </FieldGroup>
                {pricing.options.map((option, optionInd) => {
                  return (option.toLocaleLowerCase() !== 'checked' ?
                      <Pill
                          key={`${pricing.id}-${option}-${optionInd}`}
                          tabIndex={optionInd}
                          label={option}
                          onClose={() => {
                              deleteTableChartOption(pricing.id, optionInd)
                          }}
                          style={{ margin: tokens.spacingS }}
                      /> : <Pill
                          key={`${pricing.id}-${option}-${optionInd}`}
                          tabIndex={optionInd}
                          label={option}
                          style={{ margin: tokens.spacingS }}
                      />)
                  })
                }
                {
                  pricing.name &&
                  (
                    <>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{pricing.name}</TableCell>
                          {
                              packages.map((item: any, itemInd: number) => {
                                const obj = item.fields.internalName
                                return (<TableCell key={`packages-head-${itemInd}`}>
                                  {obj[Object.keys(obj)[0]]}
                                </TableCell>)
                              })
                          }
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        { pricing.rows &&
                          pricing.rows.map((item, itemInd) => (
                            <TableRow key={`${pricing.id}-${itemInd}-${itemInd}`}>
                              <TableCell>
                                <TextField
                                  id={item.name}
                                  name="name"
                                  labelText=""
                                  value={item.name}
                                  onChange={createOnChangeListName(pricing.id, item, 'name')}
                                />
                              </TableCell>
                              {
                                packages.map((tier, tierInd) => {

                                  return (
                                    <>
                                      <TableCell key={`cell-${pricing.id}-${tier}-${tierInd}`}>
                                        <Select
                                          name={`${tier.name}-${pricing.id}-${tierInd}`}
                                          id={`${tier.name}-${pricing.id}-${tierInd}`}
                                          value={item.packages[tierInd].value}
                                          onChange={updateOnChangeSelector(pricing.id, itemInd, tierInd)}>
                                          <Option value=""
                                                  selected>
                                              Please select an option...
                                          </Option>
                                          { pricing.options &&
                                              pricing.options.map(option => (<Option
                                                key={`${pricing.id}-${tier}-${tierInd}-${option}`}
                                                value={option}>
                                                  {option}
                                              </Option>))
                                          }
                                        </Select>
                                      </TableCell>
                                    </>
                                  )
                                })
                              }
                              <TableCell align="right">
                                <EditorToolbarButton
                                    label="delete"
                                    icon="Delete"
                                    onClick={() => deleteRowItem(pricing.id,itemInd)}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                    <Button
                        buttonType="naked"
                        onClick={() => addNewListItem(pricing.id)}
                        icon="PlusCircle"
                        style={{ marginTop: tokens.spacingS }}
                    >
                        Add Item
                    </Button>
                    </>
                  )
                }
                <hr />
              </div>
            )// end
          })
      }
    </>
  );
}

export default PricingChart;