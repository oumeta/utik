import React, {useEffect, useState} from 'react';

import TradingViewChart from './TradingViewChart';

import {ReportSummary} from "../types";

import {
  Badge,
  Container,
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Text,
  ThemeIcon,
  Title
} from '@mantine/core';

import {ArrowDownRight, ArrowUpRight,} from 'tabler-icons-react';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: theme.spacing.xl * 1.5,
    paddingBottom: theme.spacing.xl * 1.5,
  },

  label: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

interface StatsGridIconsProps {
  data: {
    title: string;
    value: string;
    diff?: number
    dir?: string;
    desc?: string;
  }[];
}

function StatsGridIcons({data}: StatsGridIconsProps) {
  const {classes} = useStyles();
  const stats = data.map((stat) => {
    const DiffIcon = stat.diff && stat.diff > 0 ? ArrowUpRight : ArrowDownRight;
    const DirIcon = stat.dir && stat.dir == "up" ? ArrowUpRight : ArrowDownRight;

    return (
      <Paper withBorder p="xs" radius="md" key={stat.title}>
        <Group position="apart">
          <div>
            <Text
              color="dimmed"
              transform="uppercase"
              weight={700}
              size="xs"
              className={classes.label}
            >
              {stat.title}
            </Text>
            <Text weight={700} size="xl">
              {stat.value}
            </Text>
          </div>

          {stat.dir ?
            <ThemeIcon
              color="gray"
              variant="light"
              sx={(theme) => ({color: stat.dir == "up" ? theme.colors.teal[6] : theme.colors.red[6]})}
              size={38}
              radius="md"
            >
              <DirIcon size={28}/>
            </ThemeIcon>
            : null}

          {stat.diff ?
            <ThemeIcon
              color="gray"
              variant="light"
              sx={(theme) => ({color: stat.diff && stat.diff > 0 ? theme.colors.teal[6] : theme.colors.red[6]})}
              size={38}
              radius="md"
            >
              <DiffIcon size={28}/>
            </ThemeIcon>
            : null}
        </Group>

        {stat.diff ?
          <Text color="dimmed" size="sm" mt="md">
            <Text component="span" color={stat.diff && stat.diff > 0 ? 'teal' : 'red'} weight={700}>
              {stat.diff}%
            </Text>{' '}
            {stat.diff && stat.diff > 0 ? 'increase' : 'decrease'} compared to last month
          </Text> : null}

        {stat.desc ? (
          <Text color="dimmed" size="sm" mt="md">
            {stat.desc}
          </Text>
        ) : null}

      </Paper>
    );
  });

  return (
    <div className={classes.root}>
      <SimpleGrid cols={4} breakpoints={[{maxWidth: 'sm', cols: 1}]}>
        {stats}
      </SimpleGrid>
    </div>
  );
}


interface ReportDetailsProps {
  basePath: string;
  runID: string;
}

const fetchReportSummary = (basePath: string, runID: string) => {
  return fetch(
    `${basePath}/${runID}/summary.json`,
  )
    .then((res) => res.json())
    .catch((e) => {
      console.error("failed to fetch index", e)
    });
}

const skeleton = <Skeleton height={140} radius="md" animate={false}/>;

const ReportDetails = (props: ReportDetailsProps) => {
  const [reportSummary, setReportSummary] = useState<ReportSummary>()
  useEffect(() => {
    fetchReportSummary(props.basePath, props.runID).then((summary: ReportSummary) => {
      console.log("summary", props.runID, summary);
      setReportSummary(summary)
    })
  }, [props.runID])

  if (!reportSummary) {
    return <div>
      <h2>Loading {props.runID}</h2>
    </div>;
  }

  const totalProfit = reportSummary.symbolReports.map((report) => report.pnl.profit).reduce((prev, cur) => prev + cur)
  const totalTrades = reportSummary.symbolReports.map((report) => report.pnl.numTrades).reduce((prev, cur) => prev + cur)

  const totalBuyVolume = reportSummary.symbolReports.map((report) => report.pnl.buyVolume).reduce((prev, cur) => prev + cur)
  const totalSellVolume = reportSummary.symbolReports.map((report) => report.pnl.sellVolume).reduce((prev, cur) => prev + cur)

  const volumeUnit = reportSummary.symbolReports.length == 1 ? reportSummary.symbolReports[0].market.baseCurrency : '';

  // reportSummary.startTime

  return <div>
    <Container my="md" mx="xs">
      <Title order={2}>RUN {props.runID}</Title>
      <div>
        {reportSummary.sessions.map((session) => <Badge>Exchange {session}</Badge>)}
        {reportSummary.symbols.map((symbol) => <Badge>{symbol}</Badge>)}
      </div>
      <StatsGridIcons data={[
        {title: "Profit", value: "$" + totalProfit.toString(), dir: totalProfit > 0 ? "up" : "down"},
        {title: "Trades", value: totalTrades.toString()},
        {title: "Buy Volume", value: totalBuyVolume.toString() + ` ${volumeUnit}`},
        {title: "Sell Volume", value: totalSellVolume.toString() + ` ${volumeUnit}`},
      ]}/>

      {
        /*
        <Grid>
          <Grid.Col span={6}>
            <Skeleton height={300} radius="md" animate={false}/>
          </Grid.Col>
          <Grid.Col xs={4}>{skeleton}</Grid.Col>
        </Grid>
        */
      }
      <div>
        {
          reportSummary.symbols.map((symbol: string, i: number) => {
            return <TradingViewChart key={i} basePath={props.basePath} runID={props.runID} reportSummary={reportSummary}
                                     symbol={symbol} intervals={["1m", "5m", "1h"]}/>
          })
        }
      </div>

    </Container>
  </div>;
};

export default ReportDetails;
